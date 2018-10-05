
[![NPM](https://nodei.co/npm/rx-txjs.png)](https://nodei.co/npm/rx-txjs/)
[![dependencies Status](https://david-dm.org/tsemach/typescript-txjs/status.svg)](https://david-dm.org/tsemach/typescript-txjs)

# Application Execution Model

## Documentation
###Full document is now [here](https://rxjs.gitbook.io/rx-txjs/) 

##What's New
* **`Recorder`** -  a job can now record all the data pass between components for debugging and regression tests. To use the recorder you need to build a class implement a the interface TxRecorderPersistenceAdapter or you can use one of the builtin recorder using MongoDB and in process memory. 

* **`Error Handling`** - a job now support error handling meaning it stop its current execution and start calling to each already called components in revers order to clean up their stuff.

* **`API change`**, change 'connect' method of TxConnector to be 'register' method.

##Plan Features
* **`Cross Service / Process Job`** -  Running a job/s a cross processes or services. This is specially for microservice architecture.

* **`Job Monitoring`** - A full job monitoring includoing a GUI to get full picture on the running jobs.

* **`Partial or Full Job Transaction / Cluster Configuration`** - Enable running a job in cluster environment where if a service failed then other able to pick a job right on from the same spot and continue for there (or run error handling).

## Description
**TxJS** implement an execution model based on [RxJS](https://rxjs-dev.firebaseapp.com/) and [TypeSript](https://www.typescriptlang.org/).
In many cases application needs to preform a flow (some job) which is a collection of small "steps" (a component).
This get complicated when some of the steps are asynchronous specially in nodejs environment.    

So this module aim to provide a set of classes helping to modeling a design solving such problems.

* **Component** - is one of the building block of a job. it is just a regular class (usually a singleton) which does any work. 
BUT a component has NO API to activate its work, you can say that components is kind of `floating in the air`. 
The only way to communicate with a component is by *send it a message*. What unique about a component is 
that its include a "mountpoint". Using this *mountpoint* the component able to communicate with the world. 

* **MountPoint** - is a class which has two way communication channels with the world. 
A component use a mountpoint to get messages on "*tasks*" channel and reply back "*reply*" channel. 
Mountpoint is using two RxJs Subjects to get and send back messages.

* **Job** - is a class store collection of components which are running one by another to 
for fill a complete flow. Output of previous component is the input to the next one. 
A job use the component's mountpoint to send its task then while getting reply it 
send it to next one. 

    >One of strong feature of a Job to serialize / deserialize. In the middle of a Job execution 
    you serialize it to a JSON, store it then later on rebuild it and continue it execution 
    in the exect point where it stop. 
    

* **MountPoint Repository** - A class generate and store mountpoints by their names or Symbols.
So by getting the mountpoint from the registry you can use it to communicate with a component.

* **Task** - a wrapper object you data travel between the components during execution. It include 
a head property and data property. The head is a generic type where the data is any type. 

* **Job Registry** - a class store Job by their uuid. Also you can set the job registry with a "persistence driver" use
by a job to persist them self (according to execution options). Currently the driver is global for al jobs, in the later 
releases it will include more detail scoping so you will be able to different persistence driver to different jobs.   

## How To Use It
First create a component/s see the quick start for example.
On the most simple case you just communicate with the component by: 

````typescript
mountpoint = TxMountPointRegistry.instance.create(<component-name>);
mountpoint.tasks().next(TxTask(...));
```` 

Of course you can create sevral components communicate with them regardless of any job execution.
Use the TxMountPointRegitry to retreive the component's mountpoint.
- **mountpoint.tasks().next(new TxTask(head, data))** - sending taks to a component. 

Use the TxMountPointRegitry to retreive the component's mountpoint.
- **mountpoint.reply().next(new TxTask(head, data))** - sending reply to a component usually the one that send the tasks. 

Use the TxMountPointRegitry to retreive the component's mountpoint.
- **mountpoint.tasks().subscribe((data) => {..})** - to receive tasks from anyone

Use the TxMountPointRegitry to retreive the component's mountpoint.
- **mountpoint.reply().subscribe((data) => {..})** - to receive reply from onyone.  

#### Adding Job
##### TxJob Creation and Running

To construct a set of components running one after the other you can use the Job class.
- First create: `let job = new Job('job-1')`
- Then add some component to it by using add method: `job.add(TxMountPointRegistry.instnace.get(<component-name>)`
- Finally you can run by *execute* | *step* | *continue* methods to launch the execution.

##### TxJob events
TxJob send two events **isCompleted** and **isStopped**.
- **isCompleted** - is send when all components where executed. use job.getIsCompleted().subscribe(..);
- **isStopped** - on single step, after each step is completed. use job.getIsStopped().subscribe(..);
- **onComponent** - notify on every reply from a component. use job.getOnComponent().subscribe(..); 

## Persistence
The persistence enable you to serialize certain job, store it in some external storage then reconstruct later one and 
continue the execution (by *continue* method) exactly from the same place. To use the persistence you have two options one using 
the *TxJobPersistAdapter* or using the low level *job.toJSON* and *job.upJSON* methods.

##### Using TxPersistenceAdapter
- create a class which implements TxJobPersistAdapter. Implement save and read method. 
- `TxJobPersistAdapter.save(uuid: string, json: TxJobJSON, name?: string)`: this will called by the framework when a job needs to persist.
- `TxJobPersistAdapter.read(uuid: string): TxJobJSON`: this will call by framework when it need to reconstruct a Job.
- register you class on the *TxJobRegistry* as follow:
  ````
  let persist = new Persist(); // class that implements TxJobPersistAdapter
  TxJobRegistry.instance.driver = persist;
  ```` 
>Note: the **TxJobJSON** is the job serialize type. 

This will store the job state before execute each component. The method save is up to you your storage implementation.
Usually persistence goes with with *run-until* execution option. Using execute with run-until:
````
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

Once a job is persist it's state saved on the storage and removed from registry (if *persist.destroy* is true)
So to continue the exection you need to do:
````
// on any part in the code
let job = TxJobRegistry.instaprivate _driver: TxJobPersistAdapter = null;nce.rebuild(uuid); // rebuild the job accorsing to it's uuid;

Job.continue(new TxTask(..));
````

## C2C - Component-2-Component Communication
This feature enable you to set a direct communication channels between components. This save you 
from the hassle of configure the I/S just to transfer data between components. There are two types 
of data transports the library support *'message queue'* and *'node express'*. 

The classes involving the C2C:

- **TxQueuePoint** - an object able to connect, send and receive data from other end-point components.
It has internally an object implement TxConnector interface. the TxConnector define three methods
*register*, *next* and *subscribe*. The TxConnector implement the underline detail of your transport details.
The class implement TxConnector, whether it is default TxConnectorRabbitMQ or your implementation, is injected into TxQueuePoint during creation.  

>To use your implementation of TxConnector you need to register it on the TxQueuePointRegistry using setDriver method.

- **TxRoutePoint** - work the same as TxQueuePoint but iot use node express as the underline communication I/S. 

>To use your implementation of TxConnector you need to register it on the TxRoutePointRegistry using setDriver method.

- **TxQueuePointRegistry** - an object able to create, store and retrieve TxQueuePoint objects. 
Use the method TxQueuePointRegistry.setDriver to register your driver (class that implement TxConnector).

- **TxRoutePointRegistry** - an object able to create, store and retrieve TxRoutePoint objects.
Use the method TxQueuePointRegistry.setDriver to register your driver (class that implement TxConnector). 

### How It Work
  
- **set you driver** - first you need to define a connector driver. a driver is an object implement 
**`TxConnector`** interface. 
>**NOTE:** if you are using RabbitMQ message queue then you can use the builtin support for RabbitMQ, so safly you can skip the driver stuff. 

> See the builtin TxConnectorRabbitMQ for an example. 
```typescript

export interface TxConnector {
  subscribe: (any) => void;

  register(service, route);
  next(service: string, route: string, data: any);
  close();
}

```
The driver is one for all components. API is as follow:
1. **subscribe** - a registration callback method where you will get the data.
2. **next** - sending data to other service on a service/route.
3. **register** - set the connection. In the case RabbitMQ is set the exchange/queue/binding. This way other components may recognaize you.

Once your driver is working you need to register it into TxQeuePointRegistry as:
````typescript
TxQueuePointRegistry.instance.setDriver(YourClass);

// for example
class MyConnector implements TxConnector {
  ...
}
TxQueuePointRegistry.instance.setDriver(MyConnector);
````
- **use subscribe / next** - now you can define your connector (or use the builtin RabbitMQ connector) 
to define subscribe and next methods to receive and send data.

See the following example:
````typescript
export class Q1Component {
  presistDriver
  queuepoint: TxQueuePoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    register
    routepoint
    await this.queuepoint.queue().register('service-1.queuepoint', 'Q1Component.tasks');

    // incoming data from other components are received here using the subscribe method. 
    await this.queuepoint.queue().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] got data = " + data);

   // for example
class MyConnector implements TxConnector {
  ...
}
TxQueuePointRegistry.instance.setDriver(MyConnector);
````
- **use subscribe / next** - now you can define your connector (or use the builtin RabbitMQ connector)
to define subscribe and next methods to receive and send data.

See the following example:
````typescript
export class Q1Component {
  presistDriver
  queuepoint: TxQueuePoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    register
    routepoint
    await this.queuepoint.queue().register('service-1.queuepoint', 'Q1Component.tasks');

    // incoming data from other components are received here using the subscribe method.
    await this.queuepoint.queue().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] got data = " + data);

        // sending reply back to sender.
        await this.queuepoint.queue().next('service-2.queuepoint', 'Q2Component.tasks', {from: 'service-1.queuepoint', data: 'data'});
      });

    return this;
  }
}
     // sending reply back to sender. 
        await this.queuepoint.queue().next('service-2.queuepoint', 'Q2Component.tasks', {from: 'service-1.queuepoint', data: 'data'});
      });

    return this;
  }
}
````

## Plan Features for Next Version
- **Component-to-Component** - **done since 0.0.21** a communication between components which are not on the same 
process. This will encapsulate  communication between components via some communication channel like message queue or HTTP, For example in case of microservices architechture  where one component need to send a message to other component on a different service and get reply back. 

- **Record / Repaly** - able to save all the data passing between components of certain Job's 
execution and keep track of what component receive what data. Then the ability to play it back 
to all components, to a single one or to a group of components. This tool is great for regression tests.

- **MountPoint Names String Literal** - change mountpoint names to be TypeScript string literal instead of just string.   

- **Persistence Adapter Per Type** - the ability to have different persistent drivers so different jobs can use different persistent driver.   
// for example
class MyConnector implements TxConnector {
  ...
}
TxQueuePointRegistry.instance.setDriver(MyConnector);
````
- **use subscribe / next** - now you can define your connector (or use the builtin RabbitMQ connector)
to define subscribe and next methods to receive and send data.

See the following example:
````typescript
export class Q1Component {
  presistDriver
  queuepoint: TxQueuePoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

// for example
class MyConnector implements TxConnector {
  ...
}
TxQueuePointRegistry.instance.setDriver(MyConnector);
````
- **use subscribe / next** - now you can define your connector (or use the builtin RabbitMQ connector)
to define subscribe and next methods to receive and send data.

See the following example:
````typescript
export class Q1Component {
  presistDriver
  queuepoint: TxQueuePoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    register
    routepoint
    await this.queuepoint.queue().register('service-1.queuepoint', 'Q1Component.tasks');

    // incoming data from other components are received here using the subscribe method.
    await this.queuepoint.queue().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] got data = " + data);

        // sending reply back to sender.
        await this.queuepoint.queue().next('service-2.queuepoint', 'Q2Component.tasks', {from: 'service-1.queuepoint', data: 'data'});
      });

    return this;
  }
}
// for example
class MyConnector implements TxConnector {
  ...
}
TxQueuePointRegistry.instance.setDriver(MyConnector);
````
- **use subscribe / next** - now you can define your connector (or use the builtin RabbitMQ connector)
to define subscribe and next methods to receive and send data.

See the following example:
````typescript
export class Q1Component {
  presistDriver
  queuepoint: TxQueuePoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    register
    routepoint
    await this.queuepoint.queue().register('service-1.queuepoint', 'Q1Component.tasks');

    // incoming data from other components are received here using the subscribe method.
    await this.queuepoint.queue().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] got data = " + data);

        // sending reply back to sender.
        await this.queuepoint.queue().next('service-2.queuepoint', 'Q2Component.tasks', {from: 'service-1.queuepoint', data: 'data'});
      });

    return this;
  }
}
  constructor() {
  }

  async init() {
    register
    routepoint
    await this.queuepoint.queue().register('service-1.queuepoint', 'Q1Component.tasks');

    // incoming data from other components are received here using the subscribe method.
    await this.queuepoint.queue().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] got data = " + data);

        // sending reply back to sender.
        await this.queuepoint.queue().next('service-2.queuepoint', 'Q2Component.tasks', {from: 'service-1.queuepoint', data: 'data'});
      });

    return this;
  }
}
   
## Conribution
You can send me pull request on [GitHub] (https://github.com/tsemach/typescript-txjs) or you can 
email me [here](mailto:tsemach.mizrachi@gmail.com) any feedback, ideas are most or even better
if you like to contribute you are more then a welcome.   
 
----
## Install
>TypeScript: you need to have typescript installed see [how](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

````
npm install --save rx-txjs
````
----
### Running the Tests
````
npm test
```` 

>TxJS is a collection of classes you enable to build an application under nodejs as a set of *components* which communicate between then by *mount-points*.
A component is a regular [TypeSript](https://www.typescriptlang.org/) class which expose no API. It receive it's commands by a RxJS's Subject next / subscribe..
----
## Quick Start
In the package by **`npm install --save rx-txjs`**

### For TypeScript users:

* Creating a component
````typescript

import { TxMountPoint, TxMountPointRegistry, TxTask } from 'rx-txjs';

export class Component {
  // NOTE: you can use Symbol('GITHUB::GIST::C1') as mountpoint identifier as well as a string.
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C1');

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        console.log('[Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));                  

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask('from Component', 'ok', task['data']))
      }
    )

    this.mountpoint.undos().subscribe(
      (data) => {
          console.log('[Component:undo] going to undo my stuff, data = ' + JSON.stringify(data, undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          this.mountpoint.reply().next(new TxTask('from Component', 'ok', data['data']))
      }
    )
  }

}  
````

* Creating a Job
````typescript
  let job = new TxJob();

  job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
  job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
  job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

  job.execute(new TxTask(
    'create',
    '',
    {something: 'more data here'})
  );  
````

### For JavaScript users:

* Creating a component
````javascript
const txjs = require('rx-txjs');

/**
 * a simple component register it's mountpoint after tne name 'COMPONENT'
 * 
 * To communicate with the component do:
 * 
 * let mp = txjs.TxMountPointRegistry.instance.get('COMPONENT'); 
 * mp.next(new TxTask('test', 'status', data = {}));
 */
class Component {

  constructor() {
    this.mountpoint = txjs.TxMountPointRegistry.instance.create('COMPONENT');    
  
    this.mountpoint.tasks().subscribe(
      (task) => {
        console.log('[G2Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          
        
        this.mountpoint.reply().next(new txjs.TxTask('Component', '', task['data']));
      }
    )
  }
}  

module.exports = new Component();
````

----
# Classes

##**TxMountPoint** 
  - a class enable two ways communication between any two components.
  - it include two RxJS subjects one for *tasks* and other for *reply*.
    
  Defining a mount point is as:   
  ````typscript    
  // get a new mount-point under the name 'GITHUB::GIST::C2' and save on the registry
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C2');    
  ````
  Mountpoint objects are kept in TxMountPointRegistry by their identifier (a selector) which could be a string or a Symbol.

  The example above it using a string as identifier but this one is working as well:
  ````typscript    
  // get a new mount-point under the name 'GITHUB::GIST::C2' and save on the registry
  mountpoint = TxMountPointRegistry.instance.create(Symbol('GITHUB::GIST::C2');
  ````

  >NOTE: when you use Symbol make sure they all define in one central place otherwise you will not able to restore a mountpoint since the Symbol will change. For example:

  ````typescript
  class Names {
    static GITHUB_GIST_C1 = Symbol('GITHUB_GIST_C1');
    static GITHUB_GIST_C2 = Symbol('GITHUB_GIST_C2');
  }
  mountpoint = TxMountPointRegistry.instance.create(Names.GITHUB_GIST_C1);
  ````

- **Component**
    - is any regular class which has a mount-point.
    - it register it's own mount point on TxMountPointRegistry under some name.
    - subscribe on tasks subject of the mount-point ready to get task messages.
    - reply back on the reply subject on the mount-point.    
    
    For example 
    ````typescript
      class C1Component {
        mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C1');    
        task: any;
    
        constructor() {
          this.mountpoint.tasks().subscribe(
            (task) => {
              logger.info('[C1Component:task] got task = ' + JSON.stringify(task, undefined, 2));
              this.task = task;
              
              // C1 got a task send reply to who ever was that                  
              mountpoint.reply().next(new TxTask('get', '', task['data']));
            }
          )  
        }
    
       .
       .
    ````
----

##**TxQueuePoint** 
  - a class using message queue communication as part of C2C (component-2-component data transfering).
  - it include a TxConntor type member implement all the details needed to connect, send and receive data from queue.
    
  Defining a queue point is as follow:   
  ````typscript    
  // get a new queue-point under the name 'GITHUB::GIST::C2' and save on the registry
  queuepoint = TxQueuePointRegistry.instance.queue('GITHUB::GIST::C2');    
  ````
  queuepoint (as mountpoint) objects are kept in TxQueuePointRegistry by their identifier (a selector) which could be a string as well as Symbol.

- **C2C**
    - first define a driver (see C2C section).
    - then define a queuepoint as follow:
    ````typescript
      queuepoint: TxQueuePoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

      constructor() {
      }

      async init() {
        await this.queuepoint.queue().register('example-1.queuepoint', 'Q1Component.tasks');
        await this.queuepoint.queue().subscribe(
          async (data) => {
            console.log("[Q1Component:subscribe] got data = " + data);
            await this.queuepoint.queue().next('example-2.queuepoint', 'Q2Component.tasks', {from: 'example-1.queuepoint', data: 'data'});
          });

        return this;
      }   
      .
      .      
    ````
----

##**TxMountPointRegistry** 
singleton class repository keep mapping of mountpoint's name or symbol --> mountpoint object instance.
The registry is use to create to create a new mountpoint object and store it's reference in the repository.

###usages

  * Create new mountpoint object and save is in the registory for later access it by other objects.
  ````typescript
  // create a new mountpoint object with a given name 'GITHUB:G1'
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::G1');
  ````
  * Add an existing mountpoint by it's name | sybmol.
  ````typescript
  // add a mountpoint object with the name 'GITHUB:G1' into the registry
  let mountpoint = new TxMountPoint('GITHUB::G1');
  TxMountPointRegistry.instance.add(mountpoint.name, mountpoint);
  ````

  * Get an existing mountpoint by it's name | sybmol.
  ````typescript
  // create a new mountpoint object with a given name 'GITHUB:G1'
  mountpoint = TxMountPointRegistry.instance.get('GITHUB::G1');
  ````
----
##**TxQueuePointRegistry**
A sindleton class repository keep mapping of queuepoint's name or symbol --> queuepoint object instance.
The registry is use to create to create a new queuepoint object and store it's reference in the repository
So later can retrive anywhere in the code.

With queuepoint object you can communicate with other components on the same process or in different process / machine.

###usages

  * Create new queuepoint object and save is in the registory for later access it by other objects.
  ````typescript
  // create a new queuepoint object with a given name 'GITHUB:G1'
  queuepoint = TxMountPointRegistry.instance.queue('GITHUB::AUTH');
  ````
  * Get an existing queuepoint by it's name | sybmol.
  ````typescript
  // create a new mountpoint object with a given name 'GITHUB:G1'
  queuepoint = TxQueuePointRegistry.instance.get('GITHUB::AUTH');
  ````
----
##**TxRoutePointRegistry**
A singleton class repository keep mapping of routepoint's name or symbol --> routepoint object instance.
The registry is use to create to create a new routepoint object and store it's reference in the repository
So later can retrive anywhere in the code.
   
With routepoint object you can communicate with other components on the same process or in different process / machine
using node express.

###usages

  * Create new routepoint object and save is in the registory for later access it by other objects.
  ````typescript
  // create a new queuepoint object with a given name 'GITHUB:G1'
  routepoint = TxRoutePointRegistry.instance.route('GITHUB::AUTH');
  ````
  * Get an existing queuepoint by it's name | sybmol.
  ````typescript
  // create a new mountpoint object with a given name 'GITHUB:G1'
  routepoint = TxRoutePointRegistry.instance.get('GITHUB::AUTH');
  ````
----
##**TxComponent**

tx-component.ts is TypeScript decorator helping you defining a component with a mountpoint.
the TxComponent decorator implicit add a mountpoint as property and register is under the 
'selector' property of the decorator. 
Also tasks and undos methods are as specifying in the decorator configuration.

>NOTE: due to some hard time the TypeScript decorator is giving me the 'tasks' and 'undos'
methods names can't be changes. later on you will be able to define any methods to like. 
  
Use it as follow:
    
````typescript
import createLogger from 'logging';
const logger = createLogger('Job-Test');

import { TxComponent } from '../../src/tx-component';
import { TxTask } from '../../src/tx-task';

@TxComponent({
  selector: 'GITHUB::GIST::D1',
  tasks: 'tasks',
  undos: 'undos'
})
export class D1Component {
  constructor() {
      logger.info("[D1Component:constructor] ctor ..");      
  }

  tasks(data) {
    logger.info('[D1Component:tasks] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask('[D1Component:tasks] tasks from D1', 'ok', data['data']));
  }

  undos(data) {
    logger.info('[D1Component:undos] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask('[D1Component:tasks] undos from D1', 'ok', data['data']));
  }
}
````

----           
##**TxJob**
- A class able to store several components and execute them as a chain.
- First task send to the first component, it's reply send to the second component and so on.

>**IMPORTANT**: after finishing using a job to MUST call to release method on the job otherwise you will 
suffer memory leaks as well as un necessary callbacks calling.   

For example a job may looks like that:                
````typescript
import { TxMountPointRegistry } from '../src/tx-mountpoint-registry';

class Names {
  static GITHUB_GIST_C1 = Symbol('GITHUB_GIST_C1');
  static GITHUB_GIST_C2 = Symbol('GITHUB_GIST_C2');
  static GITHUB_GIST_C3 = Symbol('GITHUB_GIST_C3');
}

let job = new TxJob(); // or create througth the TxJobRegistry

job.add(TxMountPointRegistry.instance.create(Names.GITHUB_GIST_C1));
job.add(TxMountPointRegistry.instance.create(Names.GITHUB_GIST_C2));
job.add(TxMountPointRegistry.instance.create(Names.GITHUB_GIST_C3));

job.execute(new TxTask(
  'create',
  '',
  {something: 'more data here'})
);
 ````
##**TxTask** 
- is a simple class include three members 'method', 'status' and 'data'.
- the task object is travel around all taksks / reply between components.    

Example of using a TxTask with generic head:
````typescript
type Head = {
  source: string;
  method: string;
  status: string;
}

type Data = { 
  data: string
}

let t = new TxTask<Head>({source: 'other', method: 'doit', status: 'ok'}, {data: 'this is again my data'});

let h: Head = t.head;
let d: Data = t.data;

assert.deepEqual({source: 'other', method: 'doit', status: 'ok'}, h);
    assert.deepEqual({data: 'this is again my data'}, d);
````

----
## Job API

### **`TxJob::execute`** 
Run all component one after the other, TxTask is passing between components, the output of a component is the input of 
the next component.

#### arguments
- *TxTask*: an object including your data
- options: a directive to execute 
  - *until*: **{util: 'GITHUB::GIST::C2'}** run until component GITHUB::GIST::C2 then stop.
  use continue to resume the process. 

#### usage

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

### **`TxJob::continue`** 
Continue running the job from it's current state, this is useful when rebuild the Job with **`upJSON`** (deserialize)

#### arguments
- *TxTask*: an object including your data 

#### usage

````typescript
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
````

### **`TxJob::step`** 
Run the job's components step by step.

#### arguments
- *TxTask*: an object including your data passing to each component separately.  

#### usage

````typescript
let C1 = new C1Component();
let C2 = new C2Component();

let C3 = new C3Component();

let job = new TxJob();

job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

job.step(new TxTask(
  'step-1',
  '',
  {something: 'more data here'})
);

job.step(new TxTask(
  'step-2',
  '',
  {something: 'more data here'})
);

job.step(new TxTask(
  'step-3',
  '',
  {something: 'more data here'})
);
````

### **`TxJov::execute|continue with TxJobExecutionOptions`** 
Use TxJobExecutionOptions to change execution default behavior.
The object is as follow:
````typescript
export interface TxJobExecutionOptions {
  persist: {
    ison: boolean;
    destroy: boolean;
  };
  execute: {
    until: string;
  }
}
````
#### parameters
- *persist.ison*: define if need to persist a job before calling to every component.
- *persist.destory*: define if need to completed destory the job when a job is reaching to it's execute.until component.
- *execute.until*: define the component's mountpoint name (sring | symbol) where need to stop and destory if persist.destory is on.

#### usage

````typescript
let C1 = new C1Component();
let C2 = new C2Component();
let C3 = new C3Component();

// NOTE: you can use Symbols as well (see TxJob above).
let job = new TxJob(); // or create througth the TxJobRegistry

job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

job.execute(new TxTask({
    method: 'create',
    status: ''
  },
  {something: 'more data here'}
  ),
  {
    persist: {ison: true, destroy: true},
    execute: {until: 'GITHUB::GIST::C2'}
  } as TxJobExecutionOptions
);
````

### **`TxJob::toJSON`** 
Serialize TxJob to JSON so it can persist and rebuild later on.

#### usage

````typescript
let job = new TxJob(); // or create througth the TxJobRegistry

job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

let serialize = job.toJSON();
````

### **`TxJob::upJSON`** 
Deserialize TxJob from JSON, togther with continue you can stoe the 
JSON in the database (or some other persistency) then rebuild it.

#### usage

````typescript
let job = new TxJob(); // or create througth the TxJobRegistry

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

### **`TxJob::reset`** 
Return the job to it's initial state so it can run again.

#### usage

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

job.reset();

job.execute(new TxTask(
  'create',
  '',
  {something: 'more data here'})
);  
````

### **`TxJob::undo`** 
Run undo sequence on previous execute / continue.
The **undo** send undo message to each already executed component in forward or backward order.

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

For example if the chain including C1, C2, C3. 
After the execution, calling to undo with backward order will initiate a sequence 
of undo call to each component in reverse order, C3, C2, C1. 

#### usage

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
----
## **`TxComponent`** 
Creating a component using Angular component style.
Decorator config:
* **selector**: the component's mountpoint identifier in the registry.
* **tasks**: a method run when some tasks message is received from mountpoint.
* **undos**: a method run when some undos message is received from mountpoint.

````typescript
@TxComponent({
  selector: 'DECORATOR::D2',
  tasks: 'tasks',
  undos: 'undos'
})
export class Component {
  constructor() {
    ...      
  }

  tasks(data) {
    ...
    this.mountpoint().reply().next(new TxTask({..})); 
  }

  undos(data) {
    ...
    this.mountpoint().reply().next(new TxTask({..}));
  }
}
````

For example if the chain including C1, C2, C3. 
After the execution, calling to undo with backward order will initiate a sequence 
of undo call to each component in reverse order, C3, C2, C1. 

#### usage

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
----
##**TxQueueContainer | TxRouteContainer**
Wrapper classes around inversifyJS container library. You can create a component by inject all its dependencies. 

###usages

  * Create a component Q1Component using TxQueueContainer injector.
  ````typescript

    // define a component something like this.
    @injectable()
    export class Q1Component {
      @inject(TxTYPES.TxQueuePoint) queuepoint;

      constructor() {
      }

      async init() {
        ...
      }
    }

    // prepare injector for Q1Component - this done one time.
    TxQueueContainer.setDriver(TxConnectorRabbitMQ); // optional, otherwise use default TxConnectorRabbitMQ
    TxQueueContainer.addComponent<Q1Component>(Q1Component, 'Q1Component');
       
    // create new 'Q1Component' component under the name 'Q1COMPONENT::QUEUE::CONTAINER'
    co = TxQueueContainer.get('Q1Component', 'Q1COMPONENT::QUEUE::CONTAINER');

    // send something to queue.
    co.queuepoint.queue.next(..);
  ````
  * Create a component Q2 which has some other member in it.
  ````typescript

    // define Q2Component which has other member.
    @injectable()
    export class QMember {
      @inject('QMember::name') name: string;

      constructor() {}
      ....
    }

    @injectable()
    export class Q3Component {
      @inject(TxTYPES.TxQueuePoint) queuepoint;
      @inject('QMember') qmember: QMember;

      constructor() {}

      async init() { ... }

      getQMember() { return this.qmember; }
    }

     // prepare injector for Q2Component, this done once
    TxQueueContainer.setDriver(TxConnectorRabbitMQ);
    TxQueueContainer.addComponent<R1Component>(Q3Component, 'Q3Component');
    TxQueueContainer.addBind<QMember>(QMember, 'QMember');

    // create 'Q3Component' where name 'tsemach' is inject into QMember of Q2Component
    TxQueueContainer.addBindConstantValue<string>('QMember::name', 'tsemach');        
    cp = TxQueueContainer.get('Q3Component', 'Q3COMPONENT::QUEUE::CONTAINER');
  ````
----
##How to Check Changes on Local Package

Change and test locally the package for publish to npm.
- run ````npm pack```` to create local *.tgz package 
- on a use code run ````npm install file:<path-to-rx-txjs-root-dirctory````
- publish to npm by ```npm publish```    
  
  
  

