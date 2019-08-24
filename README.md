
[![NPM](https://nodei.co/npm/rx-txjs.png)](https://nodei.co/npm/rx-txjs/)
[![dependencies Status](https://david-dm.org/tsemach/typescript-txjs/status.svg)](https://david-dm.org/tsemach/typescript-txjs)


## Documentation
### more info can be found [here](https://rxjs.gitbook.io/rx-txjs/) 

## What's New
`version 0.3.5`
Add subscribe to routepoint, to get reply from route you can do: `reply = await routepoint.tasks().next(new TxRouteServiceTask<any>({..}, {..}));` 
Now you can subscribe on the reply channel. See RoutePoint for more details

`version 0.3.4`
Change `TxMountPoint` such as reply is send back only to the sender. This is similar to `TxDoublePoint` but you have stil the option of sending reply back to all subscribers on the reply channel

`version 0.3.0`
Refactory of the routepoint code. New API is present for using C2C (Component-2-Component) communcation.
Add support for routepoint publication and discovery services.

You can use [typescript-publisher](https://www.npmjs.com/package/typescript-publisher) as publication and discovery sevice.
See below for more details.

`version 0.2.21`
1. Rx-TXJS is now supporting DAG Job, see tests/job/tx-job-execute-goto-simple.spec.ts for example.
2. Adding short version of mountpoint subscription, see tests/mountpoint/tx-mountpoint-method.spec.ts for example.

## Introduction
Rx-txjs implement an execution model based on decoupling objects (a *Components*) under Nodejs environment. 

You implement your business logic using a components. A components are regular classes register themself to rx-txjs using *mountpoint*. A mountpoint is rx-txjs classes able to interact with your class by a publish / subscribe model.

>Note: activating a component is done by publish a "message". Rx-txjs use mountpoint/s to publish a message to a component.

A job is use to run a sequence of components to acomplish a complex business log.

## Rx-TXJS Hello World 

define a component return 'Hello'
````typescript
import { TxMountPointRxJSRegistry, TxTask } from 'rx-txjs';

// define Hello component
class World {
  constructor() {
    mountpoint = TxMountPointRxJSRegistry.instance.create('WORLD');
    mountpoint.tasks().subscribe(
      (task) => {
        // reply back to caller 
        tasks.reply().next(new TxTask({}, task.data + ' World'));
      }
    )  
  }
}
````

Create an instance of World so it able to register it under TxMountPointRxJSRegistry.
Then send a message to it.
````typescript
new World();

// get a mountpoint of Hello component so you can interact with it
const mountpoint = TxMountPointRxJSRegistry.instance.get('WORD');

// subscribe to messages coming from Hello component
mountpoint.reply().subscribe(
  (data) => {
    console.log(data.getData());  // <-- Hello World
});

// send a message to Word component
mountpoint.tasks().next(new TxTask({}, 'Hello'));
````
## A Short Version of World Component
````typescript
import { TxMountPointRxJSRegistry, TxTask } from 'rx-txjs';

// define World component
class World {
  mountpoint = TxMountPointRxJSRegistry.instance.create('WORLD');

  constructor() {
    // create a subscription and call to this.run method
    this.mountpoint.tasks().method('run', this);
  }

  run(task: TxTask<any>) {        
    // reply back to caller 
    task.reply().next(new TxTask({}, task.data + ' World')); 
  }
}

// call it where {method: 'run'} is in the heas of TxTask
mountpoint.tasks().next(new TxTask({method: 'run'}, 'Hello'));
````

To interact with a Component you are using several version a * **MountPoints** * objects.

## MountPoints
1. * **TxMountPoint** * - implement two ways 1:N traditional public / subscribe model. With TxMountPoint you can send a message to a Component and having multiple subscribe listen to it's reply (see the like above for full documentation). 
2. * **TxSinglePoint** * - implement 1:1 one way communication channel with the Component. Use this MountPoint to send a data but in order to get it's reply you have to provide your own (other) TxSinglePoint object.
3. * **TxDoublePoint** * a kind of wrapper that include two different SinglePoint to implement bi-directional communication channels with a Component.
4. * **TxRoutePoint** * a kind of MountPoint that implement Class-2-Class direct communication over express (HTTP).
5. * **TxQueuePoint** * a kind of MountPoint that implement Class-2-Class direct communication over queue system.

## Featute List
* **`Job Execution`** -  Able to run an series of Components implement one more complex job.
  
* **`Job Continue / Step / Undo`** - features of job executions (see link above for full documentation)
  
* **`Persistence`** - able to save each step of execution. This feature is well fit with 'Job Continue' so you can run a job until certain point, stop it and resume it later on.
  
* **`Error Handling`** - in case of error, have the chance for each object to clean up.
  
* **`Job Events`** - job has many events you ca n listen to during it's execution. 
  
* **`Recording`** - record the data passing between objects during the execution of a Job. 
  
* **`C2C`** - Class-2-Class communication enable to communication directory between to Components over some communication channel. this could be over HTTP (node express) or some kind of queue system (like Kafka, RabbitMQ).
  
* **`S2S`** - Cross Service Job, this enable to run a job spreading on several services.

* **`Monitor`** - a full monitor solution.
  
* **`Distribution`** - run a job's components in different service / container instance.
      
## Quick Start
### Using a Component
Add the following code line to your class
````typescript
mountpoint = TxMountPointRegistry.instance.create('MOUNTPOINT::NAME');
```` 
Note: you can any of kind of mountpoint version depend on your specfic case.

For example your component may looks like that:

````typescript
class C1Component {
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C1');    

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C1Component:task] got task = ' + JSON.stringify(task, undefined, 2));

         // Do some stuff here ...

        // send reply back to all the subcribers
        task.reply().next(new TxTask('get', '', task['data']));
      }
    )  
  }
  // the rest of the class ...
}
````

To send a message to your component use the code line:
````typescript
let mountpoint = TxMountPointRegistry.instance.get('MOUNTPOINT::NAME');

mountpoint.task().next(new TxTask({method: 'doit'}, {data: 'this here'}));
```` 

### Using a Job
Create the components you want ( say **`C2Component`** and **`C3Component`**) them to part of a Job same as **`C1Component`**,  .

**Note:**  When using a component as part of the a job you **must** use **`TxSinglePoint`**. So in you Component define:
```typescript
let mountpoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::C1');
````

Define a Job as follow:
````typescript
let job = new TxJob();

job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C1'));
job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C2'));
job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C3'));

job.execute(new TxTask(
  'create',
  'begin',
  {something: 'more data here'})
); 
````
This will run the components in the order they defined. This is a very simple verision of the exection options.
**`job.execute`** include many more options like persist, recording, run-until and so on.

## Understand MountPoints

A 'mountpoint' is a borker object, a meeting point, able to communicate by between parts (usually classes) using different method of public / subscribe.
MountPoint ofer two way communications one is 'tasks' is send data from the caller and other for 'reply' where the receiver able to ger reply back. Some mountpoint may diffeently like `TxSinglePoint` is a type of mountpoint which has no reply channel, you can just send the data.
Other example is `TxRoutePoint` where the reply is receiving as the return value of next methof.

MountPoint is identify by its unique name (a string or a Symbol). It must be unique in a process and if you use publication then is must be unique among all services / processes

A Component which create a mountpoint use the follow: 
````typescript
mountpoint = TxMountPointRegistry.instance.create(<component-name>);
````

To subscribe on this mountpoint use:
````typescript
mountpoint.tasks().subscribe(
  (task: TxTask<any>) => {         
    // ... you suff here

    // just send the reply to whom is 'setting' on this reply subject
    task.reply().next(new TxTask({any-head-object}, {any-data-object}))

    // if error happend in your code you can single an error by:
    task.reply().error(new TxTask({any-head-object}, {any-data-object}))
  },
  (error: TxTask<any>) => {
    // the sender send you an error callback, 

    // clean you stuff and reply back on error callback
    task.reply().error(new TxTask({any-head-object}, {any-data-object}))
  }
);    
````

On any other place in the code you can send a data with this mountpoint using the `next` method and `TxTask<T>` object:
````typescript
  mountpoint = TxMountPointRegistry.instance.get(<component-name>);

  mountpoint.tasks().next(TxTask(...));
````

#### Reply back to all reply's subscribers
Usually you want to reply back to the sender however there are some cases where you want to reply to all subscribers even those who don't sent any data. This can be done by:
````typescript
  mountpoint = TxMountPointRegistry.instance.use(<component-name>);

  mountpoint.tasks().next(TxTask(...));
````

Then reply like:
````typescript
mountpoint.tasks().subscribe(
  (task: TxTask<any>) => {              
    // ... you suff here

    // just send the reply to whom is 'setting' on this reply subject
    mountpoint.reply().next(new TxTask({any-head-object}, {any-data-object}))
  }
};    
````

### Let see some more mountpoints

* **TxSinglePoint**  - implement 1:1 one way communication channel with the Component. Use this MountPoint to send a data but in order to get it's reply you have to provide your own (other) TxSinglePoint object.


* **TxDoublePoint** a kind of wrapper that include two different SinglePoint to implement bi-directional communication channels with a Component.


* **TxRoutePoint** a kind of MountPoint that implement Class-2-Class direct communication over express (HTTP).


* **TxQueuePoint**  a kind of MountPoint that implement Class-2-Class direct communication over queue system.

## RoutePoint
RoutePoint able to connect your two components on two different services by using Express.
You have to define two routepoint one on the server and other on the client.

RotuePoint is wrapping the express request, response but you have full access / control on those two.

### Server Side
Component `S1Component` define server side as follow:

````typescript
// server side routepoint configuration paramerts
const config = {
  host: 'localhost',    // my hostname
  port: 3001,           // I am listen to this port
  method: 'get',        // the HTTP method
  service: 'component', // a group of rotues
  route: 'read'         // a route under the group, /component/read
};
````

````typescript
// create a routepoint on the server side
routepoint = TxRoutePointRegistry.instance.route('GITHUB::S2', config);
````

Then define the subscription, the data coming from the client side:
````typescript
  routepoint.tasks().subscribe(
    (task: TxRouteServiceTask<any>) => {
      
      // do you stuff here

      task.reply().next(new TxRouteServiceTask<any>({
        // the headers goes to the HTTP headers on the response
        headers: {
          source: 'S1Component-server',
          token: 'FEDCBA0987654321'
        },
        // how to response look's like
        response: {
          status: 200,
          type: 'json'
        }},
        // the data of the response
        {
          source: 'S1Component', status: "ok",
          originData: task.get()
        } 
      ));      
    });
  }
````
The whole code is looks like that:
````typescript
import { TxMountPoint } from '../../src/tx-mountpoint';
import { TxRoutePointRegistry } from '../../src/tx-routepoint-registry';
import { TxRouteServiceTask } from '../../src/tx-route-service-task';

export class S1Component {    
  constructor() {
    const config = {
      host: 'localhost',
      port: 3001,
      method: 'get',
      service: 'component',
      route: 'read'
    };
    const routepoint = TxRoutePointRegistry.instance.route('GITHUB::S2', config);
    
    routepoint.tasks().subscribe(
    (task: TxRouteServiceTask<any>) => {
      logger.info('[S1Component::subscribe] got data from service: task = ' + JSON.stringify(task.get(), undefined, 2))        
      
      // task.request => this return the express request object
      // to you stuff here

      task.reply().next(new TxRouteServiceTask<any>({
        headers: {
          source: 'S1Component-server',
          token: 'FEDCBA0987654321'
        },
        response: {
          status: 200,
          type: 'json'
        }},
        {
          source: 'S1Component', status: "ok",
          originData: task.get()
        } 
      ));      
    });
  }
}

new S1Component();
````
### Client side 
The client side able to communcation with the server.

Define configuration object as folllow
````typescript
// server side routepoint configuration paramerts
const config = {
  host: 'localhost',    // my hostname
  port: 3001,           // I am listen to this port
  method: 'get',        // the HTTP method
  service: 'component', // a group of rotues
  route: 'read'         // a route under the group, /component/read
};
````
Create the rotuepoint on the registry as follow
````typescript
routepoint = TxRoutePointRegistry.instance.create('GITHUB::C1', config);        
````
> **NOTE:** on the client side you use the **`create`** not the *`route`* as in the server.

To use this client routepoint any where on the code:
````typescript
const routepoint = await TxRoutePointRegistry.instance.get('GITHUB::C1');
const reply = await routepoint.tasks().next(new TxRouteServiceTask<any>({source: 'service-a', token: '1234'}, data));
````
> **NOTE:** The object {source: 'service-a', token: '1234'} is goes to the http headers of the request.

The whole code may looks like that:
import { TxMountPoint } from '../../src/tx-mountpoint';
import { TxRoutePointRegistry } from '../../src/tx-routepoint-registry';

````typescript
export class C1Component {
  private routepoint: TxMountPoint;
  
  constructor() {
    const config = {
      host: 'localhost',
      port: 3001,
      method: 'get',
      service: 'component',
      route: 'read'
    };
    this.routepoint = TxRoutePointRegistry.instance.create('GITHUB::C1', config);        
  }
}
````

````typescript
const routepoint = await TxRoutePointRegistry.instance.get('GITHUB::C1');
const reply = await routepoint.tasks().next(new TxRouteServiceTask<any>({source: 'service-a', token: '1234'}, {command: 'do-something'})); 
````
Or you can subscribe to the reply as follow:

````typescript
routepoint.reply().subscribe(
  (task: TxRouteServiceTask<any>) => {    
    // got reply from server.    
    console.log(task.get());      // both head and data
    console.log(task.getHead());  // just the head, the http headers is under task.getHead().headers
    console.log(task.getData());  // the body

    // task.repsonse  => this return the express response object.
  }
);
````

## Task
A task is a generic object of head and data, something like that:
````typescript
export class TxTask<T> {  
  head: T;
  data: any;
  ...
}
````
You can use it like the following:
````typescript
interface Head {
  source: string;
  method: string;
  status: string;
}
  
interface Data {
  data: string
}

let t = new TxTask<Head>(
  {source: 'other', method: 'doit', status: 'ok'}, 
  {data: 'this is again my data'});
    
let h: Head = t.head; // or let h: head = t.getHead()
let d: Data = t.data; // or let d: Data = t.getData()
````

## Using a Job

A Job runs a set of components one by after the other in the same order as they
* First create: `let job = new Job('job-1')`
* Then add some component to it by using add method: `job.add(TxMountPointRegistry.instnace.get(<component-name>)`
* Finally you can run by execute | step | continue methods to launch the execution.

### Execute Jobs methods
* **execute** - run the all component one after the other. 
* **continue** - continue running the jobs from where it stoped, usually this is relevant when job rebuild after serialization.

### TxJob Functionality

* execute - run the components one after the other
  * option: persistence - (toJSON / upJSON) before every component activation serialize the job into a persistence so it can recover and continue from the exact same place.
  * option:until - run until certain component and stop. the execution can resume with execute / continue and step methods
  * option:record - save the data pass between components so it can use for debugging and regression tests.

* continue - run a job right from the same place where is stop.
* step - run the job in single step. when each step is completed an even will rise indicate to complete.
* toJSON / upJSON - and serialize / desalinize methods. 
* Error handling - if some component has an error it reply through the tasks mountpoint error channel. then the job hold it's execution and start running error sequence on all the called components.

### TxJob events
TxJob send two events isCompleted and isStopped.

* `isCompleted` - is send when all components where executed. use job.getIsCompleted().subscribe(..);
````typescript
const job - new Job('..');
job.add(...)

const needToUnsubscribe = job.getIsCompleted().subscribe(
  (task: TxTask<any>) => {
        // do your stuff...

  needToUnsubscribe.unsubscribe();        
});
````
* `isStopped` - on single step, after each step is completed. use job.getIsStopped().subscribe(..);

* `onComponent` - notify on every reply from a component. use job.getOnComponent().subscribe(..);

* Using once: 
````typescript
TxJobRegistry.instance.once('job: ' + job.getUuid(), (data: TxJobEventType) => {      
  console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
});
````
## Persistence
The persistence enable you to serialize certain job, store it in some external storage then reconstruct later one and continue the execution (by continue method) exactly from the same place. To use the persistence you have two options one using the TxJobPersistAdapter or using the low level job.toJSON and job.upJSON methods.

### Using TxPersistenceAdapter
* create a class which implements TxJobPersistAdapter. Implement save and read method.
* `TxJobPersistAdapter.save(uuid: string, json: TxJobJSON, name?: string)`: this will called by the framework when a job needs to persist.
* `TxJobPersistAdapter.read(uuid: string): TxJobJSON`: this will call by framework when it need to reconstruct a Job.
* register you class on the TxJobRegistry as follow:
````typescript
1. let persist = new Persist(); // class that implements TxJobPersistAdapter
2. TxJobRegistry.instance.driver = persist;
````
>Note: the TxJobJSON is the job serialize type.

This will store the job state before execute each component. The method save is up to you your storage implementation. Usually persistence goes with with run-until execution option. Using execute with run-until:
````typescript
// execute the job until it reach component <component-name | component Symbol>
job.execute(new TxTask({
    method: 'create',    
  },
  {something: 'more data here'}
  ),
  {
    persist: {ison: true, destroy: true},
    execute: {until: <component-name | component-Symbol>}
  } as TxJobExecutionOptions
);
````
Once a job is persist it's state saved on the storage and removed from registry (if persist.destroyis true) So to continue the exection you need to do:
````typescript
// on any part in the code
const job = await TxJobRegistry.instance.rebuild(<uuid of the save job>);
job.continue(..)
````

Job.continue(new TxTask(..));

## Recording
With recording feature you can record all the data pass between components during execution.
### Record Persist Driver
This driver is use by the job to save components data. It a class implement the interface:
````typescript
interface TxRecordPersistAdapter {
/**
   * Insert an execution into storage. The pair executeUuid:sequence consider the execution ID.
   * if executeUuid:sequence exist then throw an exception.
   *
   * It should be possible to retrieve all executions of a specific job.
   *
   * @param {TxRecordIndexSave} index - encapsulate properties about the execution.
   * @param {TxRecordInfoSave} info - a wrapper around tasks and reply data.
   */
  insert(index: TxRecordIndexSave , info: TxRecordInfoSave): void;

  /**
   * Update an exist execution of a specific job. The pair executeUuid:sequence consider the execution ID.
   * if executeUuid:sequence is not exist then throw an exception.
   *
   * @param {TxRecordIndexSave} index - encapsulate properties about the execution.
   * @param {TxRecordInfoSave} info - a wrapper around tasks and reply data.
   */
  update(index: TxRecordIndexSave , info: TxRecordInfoSave): void;

  /**
   * Delete an execution according to its Id
   * If executionId.sequence > 0 then delete a specific execute (according to its sequence)
   * if executionId.sequence == 0 then delete all steps of one job execute (all executions of a specific job run).
   * this is similar to executeUuid:*.
   *
   * @param {TxJobExecutionId} executionId
   */
  delete(executionId: TxJobExecutionId);

  /**
   * Read a specific execution. Should return exection array according to executionId
   *
   * If executionId.sequence > 0 then get a specific execute (according to its sequence)
   * if executionId.sequence == 0 then get all steps of one job execute (all executions of a specific job run).
   * this is similar to executeUuid:*.
   *
   * @param {TxJobExecutionId} executionId - a pair of executeUuid:sequence
   * @returns {Promise<TxRecordRead[]>}
   */
  asking(executionId: TxJobExecutionId): Promise<TxRecordRead[]>;

  /**
   * Close connection to storage.
   */
  close();
}
````
So to use recording you need:
1. Call to 
`TxJobRegistry.instance.setRecorderDriver(recorder);`

where 'recorder' is a class implement TxRecordPersistAdapter.

2. Turn on record: true on TxJobExecutionOptions, for example:
````typescript
job.execute(new TxTask({
    method: 'create',
    source: 'someone'
  },
  {something: 'more data here'}
  ),
  {
    persist: {ison: false},
    execute: {record: true}
  } as TxJobExecutionOptions
);
````

## Error Handling
If a component decide it has an error it reply back to world on:

`this.mountpoint.tasks().error(new TxTasks<..>(.. I have an error ..)`

Then the job stop it current execution and start error handling sequence. It send error message to every already called components in a backward order.

````
for (every components already called n backward order) do:
    mountpoint.tasks().error(..)
done
````
This will called the error callback on every components which need to clean up its stuff.

### Backward / Forward
When error occur you can force a job to run forward or backward on the component list from the point where it happend. Use the execute / continue `TxJobExecutionOptions.error.direction` propery to set it.

## Distribure Job
First define your components, for example S1Component, S2Component and S3Component like this
````typescript
export class S1Component {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::S1');

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[S1Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));                  

        // just send the reply to whom is 'setting' on this reply subject
        task.reply().next(new TxTask({method: 'from S1', status: 'ok'}, task['data']))
      }
    );    
  }
}  
````

Now you need to preset to rx-txjs an object which implement **`TxDistribute`** interface.

This object has to do two things:
1. implement send method of **`TxDistribute`** which send data to queue, express or other method of distribution.
2. On receiving push the data to TxDistributeComponent.

You can use the builtin **`TxDistributeBull`** from *rx-txjs-adapters* package which will do all the work using bull library.

````typescript
// import TxDistributeBull from rx-txjs-adapters package
import { TxDistributeBull } from 'rx-txjs-adapters';

// set the distributer so the job will know to where the send the data 
TxJobRegistry.instance.setDistribute(new TxDistributeBull('redis://localhost:6379'));
````

Now you can define the job and run it in distributed manner.

````typescript
// create the job and add it's components
let job = new TxJob('job-1'); 

job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));
````

````typescript
// define and callback when job is completed
TxJobRegistry.instance.once('job: ' + job.getUuid(), (data: TxJobEventType) => {      
  console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
});

// now execute the job with *publish* flag turn on. 
job.execute(new TxTask({
    method: 'create',
    status: ''
  },
  {something: 'more data here'}
  ),
  {
    publish: 'distribute'
  } as TxJobExecutionOptions
);        
````

* Here the complete example

````typescript
import createLogger from 'logging';
const logger = createLogger('Job-Execute-Test');

import { 
  TxSinglePointRegistry,
  TxJobExecutionOptions,
  TxTask,
  TxJob,
  TxJobRegistry,  
  TxJobEventType,
} from 'rx-txjs';

import { TxDistributeBull } from 'rx-txjs-adapters';
import { S1Component } from '../components/S1.component';
import { S2Component } from '../components/S2.component';
import { S3Component } from '../components/S3.component';

new S1Component();
new S2Component();
new S3Component();

TxJobRegistry.instance.setDistribute(new TxDistributeBull('redis://localhost:6379'));

logger.info('tx-job-distribute.spec: check running S1-S2-S3 through distribute');    

let job = new TxJob('job-1');  

job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

TxJobRegistry.instance.once('job: ' + job.getUuid(), (data: TxJobEventType) => {      
  console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
});

job.execute(new TxTask({
    method: 'create',
    status: ''
  },
  {something: 'more data here'}
  ),
  {
    publish: 'distribute'
  } as TxJobExecutionOptions
);        
````

## Routepoint, Publication and Discovery
Rx-TXJS support a typeof mountpoint which is `routepoint`. This routepoint enable to communction between two Components on two different services with the same next/subscribe API as use locally in a service. 

Defining routepoint involving defining two components one for the server and one for the client.

#### `server-side` - component may looks like that:
````typescript
import { 
  TxMountPoint,
  TxRoutePointRegistry,
  TxRouteServiceTask,
  TxRouteServiceConfig
} from 'rx-txjs';

class R1Component {
  private mountpoint: TxMountPoint;

  // a routepoint configuration object
  private config: TxRouteServiceConfig = {
      host: 'localhost',
      port: 3100,
      method: 'get',
      service: 'user',
      route: 'add'
  };

  constructor() {  
    // create the routepoint, the regitry keep track of the routepoint instance by it's name
    this.mountpoint = TxRoutePointRegistry.instance.route('GITHUB::R1', this.config);

    // subscribe to upcoming calls from other services
    this.mountpoint.tasks().subscribe(
      (task: TxRouteServiceTask<any>) => {
        console.log('[R1Component::subscribe] subscribe called, task:', JSON.stringify(task.get(), undefined, 2));

        // send reply back to caller
        task.reply().next(new TxRouteServiceTask<any>({
          headers: {
            source: 'R1Component',
            token: '123456780ABCDEF'
          },
          response: {
            status: 200,
            type: 'json'
          }},
          {
            source: 'R1Component', status: "ok"
          }
        ));      
      });
  }
}
````
1. `GITHUB::R1`: is the name of the component must be unique among ALL services.
2. `Headers`: this goes to the HTTP header in the reqeust.
3. `reponse`: this define how to send the response to the client.
4. `source: 'R1Component', status: "ok"`: any data object return back to client.

`client-side` - (without publication) may looks like that, this routepoint define internally or on another service use:
````typescript
  // first create the client side routepoint. This is done once on initialization
  const config: TxRouteServiceConfig = {
    mode = 'client',    // I am on the client side
    host: 'localhost',  // <-- this is the host of other service
    port: 3100,         // <-- this is the port of other service
    method: 'get',      // <-- the method to use is 'get'
    service: 'sanity',  // the endpoint of other service is on /sanity/save
    route: 'save'
  }
  TxRoutePointRegistry.instance.create('GITHUB::R1', config);

  // then use it in where you want to get an already define routepoint on the client side
  const routepoint = TxRoutePointRegistry.instance.get('GITHUB::R1');

  // subscribe to reply from the receiver (the server)
  routepoint.subscribe(
    (task: TxTask<any>) => {
      console.log('[sendAndSubscribeServiceGet] got reply from service: ', JSON.stringify(task, undefined, 2));
    }
  );

  // make the call, send {source: 'back-client-main'}, {from: 'clientRoutePoint'} to the server
  const reply = routepoint.tasks().next(new TxRouteServiceTask<any>({source: 'back-client-main'}, {from: 'clientRoutePoint'}));
````

if you use publication then all you have to do is:

````typescript
  // then use it in where you want to get an already define routepoint on the client side
  const routepoint = TxRoutePointRegistry.instance.get('GITHUB::R1');

  // subscribe to reply from the receiver (the server)
  routepoint.subscribe(
    (task: TxTask<any>) => {
      console.log('[sendAndSubscribeServiceGet] got reply from service: ', JSON.stringify(task, undefined, 2));
    }
  );

  // make the call, send {source: 'back-client-main'}, {from: 'clientRoutePoint'} to the server
  const reply = routepoint.tasks().next(new TxRouteServiceTask<any>({source: 'back-client-main'}, {from: 'clientRoutePoint'}));
````

#### The publication and discovery enable you not to worry where the routepoint is. It save you from defining `const config = TxRouteServiceConfig {...}, TxRoutePointRegistry.instance.create('GITHUB::R1', config);`

So now you can build a complete micro-service architecture with business logic based on route point with great flexibility.

#### See https://github.com/tsemach/typescript-publisher for more details.

# API
## TxJob::execute
Run all component one after the other, TxTask is passing between components, the output of a component is the input of the next component.
### arguments
* TxTask: an object including your data
* options: a directive to execute
until: {util: 'GITHUB::GIST::C2'} run until component GITHUB::GIST::C2 then stop. use continue to resume the process.

### usage
````typescript
let C1 = new C1Component();
let C2 = new C2Component();
let C3 = new C3Component();
 
// NOTE: you can use Symbols as well (see TxJob above).
let job = new TxJob(); // or create througth the TxJobRegistry
 
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
 
job.execute(new TxTask(
  'create',
  '',
  {something: 'more data here'})
);        
````
## TxJob::continue
Continue running the job from it's current state, this is useful when rebuild the Job with `upJSON`(deserialize)

### arguments
* TxTask: an object including your data

### usage
let job = new TxJob();
let from = {
  "name": "GitHub",
  "block": "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
  "stack": "GITHUB::GIST::C2,GITHUB::GIST::C3",
  "trace": "GITHUB::GIST::C1",
  "single": false,
  "current": "GITHUB::GIST::C2"
}
let after = job.upJSON(from).toJSON();
 
job.continue(new TxTask(
  'continue',
  '',
  {something: 'more data here'})
);
 
});

### TxJob::toJSON
Serialize TxJob to JSON so it can persist and rebuild later on.
```typescript
let job = new TxJob(); // or create througth the TxJobRegistry
 
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
 
let serialize = job.toJSON();
````
## TxJob::upJSON
Deserialize TxJob from JSON, togther with continue you can stoe the JSON in the database (or some other persistency) then rebuild it.
### usage
```typescript
let  jobjob  ==  newnew  TxJobTxJob(); // or create througth the TxJobRegistry
 
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
 
// run one step, C1Component is running
job.step(new TxTask(
  'step-1',
  '',
  {something: 'more data here'})
);
 
let other = (new TxJob()).upJSON(job.toJSON());
 
// running the remaining C2Component and C3Component
other.continue(new TxTask(
  'continue',
  '',
  {something: 'more data here'})
);
````
## TxJob::reset

Return the job to it's initial state so it can run again.

### usage
```typescript
let job = new TxJob(); // or create througth the TxJobRegistry
 
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
 
job.execute(new TxTask(
  'create',
  '',
  {something: 'more data here'})
);        
 
job.reset();
 
job.execute(new TxTask(
  'create',
  '',
  {something: 'more data here'})
);
````
## TxJob::undo
Run undo sequence on previous execute / continue. The undo send undo message to each already executed component in forward or backward order.

The component register on the undo message as:
````typescript
this.mountpoint.undo().subscribe(
  (task) => {
    logger.info('[C2Component:undo] got task = ' + JSON.stringify(task, undefined, 2));
    this.method = task['method'];
 
    // just send the reply to whom is 'setting' on this reply subject
    this.mountpoint.reply().next(new TxTask('undo from C2', 'ok', task['data']))
  }
)
````
For example if the chain including C1, C2, C3. After the execution, calling to undo with backward order will initiate a sequence of undo call to each component in reverse order, C3, C2, C1.

### usage
````typescript
let job = new TxJob(); // or create througth the TxJobRegistry
 
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
 
job.execute(new TxTask(
  'create',
  '',
  {something: 'more data here'})
);        
 
job.undo(backword);
````















