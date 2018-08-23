# Application Execution Model
TxJS implement an execution model based on [RxJS](https://rxjs-dev.firebaseapp.com/) and [TypeSript](https://www.typescriptlang.org/).

### What's New 

**since 0.0.15** 
- Adding Symbol support as mountpoint identifier. see TxMountPoint below for more details

**since 0.0.8** - adding TxComponent creating a component using Angular style decorator.
- **`TxComponent`** adding Angular style TypeScript decorator for more convenient way of 
 creating a component. 
- Add documentation.
- Fix minor bugs. 

**since 0.0.3** - adding new API for handling a Job, see below for more details

- **`toJSON`**, **`upJSON`** for serialize and deserialize a Job.
- **`continue`** will conntinue running the job after deserializing.
- **`step`** running the job step by step, each calling to step run next component.
- **`add execute options`** add run **until** options to execute and continue so the  job is running until it reach a certain component then stop.
- **`undo`** run undo on each component in both forward and backward order.
- **`reset`** set initial state, rerun the job after reset. 

### Plan Features for Next Version
- **ExecuteOptions**: an object able to influence on the execution of the components like 'run until' or 'stop if' etc.
- **Component-to-Component**: a comunication between components which are not on the same process. This will encapsulate  communication between components via some communication channel like message queue or HTTP, For example in case of microservices architechture  where one component need to send a message to other component on a different service and get reply back. 
- **Symbols**: use Symbols as component selector (identifier).
----
## Install
>TypeScript: you need to have typescript installed see [how](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

````
npm install --save rx-txjs
````

To install directly from github use
````
> npm install git+http://github.com/tsemach/typescript-txjs.git

or

> npm install git+ssh://github.com/tsemach/typescript-txjs.git
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

- ## **TxMountPoint** 
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
- ## **TxMountPointRegistry**
  A singlton class repository keep mapping of mountpoint's name or symbol --> mountpoint object instance.
  The registry is use to create to create a now mountpoint object and store it's reference in the repository.

  ### usages

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
- ## **TxComponent**

    tx-component.ts is TypeScript decorator helping you defining a component with a mountpoint.
    the TxComponent decorator implicit add a mountpoint as property and register is under the 
    'selector' property of the decorator. 
    Also tasks and undos methods are as specifying in the decorator configuration.
    >NOTE: due to some hard time the TypeScript decorator is giving me the 'tasks' and 'undos'
    methods names can't be changes. later on you will be able to define any methods to like. 
      
    use it as follow:
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
- ## **TxJob**
    - A class able to store several components and execute them as a chain.
    - First task send to the first component, it's reply send to the second component and so on. 

    For example a job may looks like that:                
    ````typescript
    import { TxMountPointRegistry } from '../src/tx-mountpoint-registry';

    let job = new TxJob(); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.create('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.create('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.create('GITHUB::GIST::C3'));

    job.execute(new TxTask(
      'create',
      '',
      {something: 'more data here'})
    );
     ````
- ## **TxTask** 
    - is a simple class include three members 'method', 'status' and 'data'.
    - the task object is travel around all taksks / reply between components.
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
##How to Check Changes on Local Package

Change and test locally the package for publish to npm.
- run ````npm pack```` to create local *.tgz package 
- on a use code run ````npm install file:<path-to-rx-txjs-root-dirctory````
- publish to npm by ```npm publish```    
  
  
  

