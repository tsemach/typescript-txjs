
[![NPM](https://nodei.co/npm/rx-txjs.png)](https://nodei.co/npm/rx-txjs/)
[![dependencies Status](https://david-dm.org/tsemach/typescript-txjs/status.svg)](https://david-dm.org/tsemach/typescript-txjs)


## Documentation
### more info can be found [here](https://rxjs.gitbook.io/rx-txjs/) 

## What's New
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
  mountpoint = TxMountPointRxJSRegistry.instance.create('WORLD');

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        // reply back to caller 
        this.mountpoint.reply().next(new TxTask({}, task.data + ' World'));
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
    this.mountpoint.reply().next(new TxTask({}, task.data + ' World')); 
  }
}

// call it where {method: 'run'} is in the heas of TxTask
mountpoint.tasks().next(new TxTask({method: 'run'}, 'Hello'));
````

To interact with a Component you are using several version a * **MountPoints** * objects.

## MountPoint
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
        mountpoint.reply().next(new TxTask('get', '', task['data']));
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
Create the components you want them to run as a Job, sat **`C1Component`**,  **`C2Component`** and **`C3Component`**.

**Note:**  When using a component as part of the a job you **must** use ``TxSinglePoint``. So in you Component define:
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
    '',
    {something: 'more data here'})
  ); 
````
This will run the components in the order they defined. This is a very simple verision of the exection options.
**`job.execute`** include many more options like persist, recording, run-until and so on.

### Distribure Job

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
2. On receiving and the data to TxDistributeComponent.

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

