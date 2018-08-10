## Application Execution Model
TxJS implement an execution model based on [RxJS](https://rxjs-dev.firebaseapp.com/) and [TypeSript](https://www.typescriptlang.org/).

#### New API 
Adding new API for handling a Job, see below for more details

- **`toJSON`**, **`upJSON`** for serialize and deserialize a Job.
- **`continue`** will conntinue running the job after deserializing.
- **`step`** running the job step by step, each calling to step run next component.
- **`add execute options`** add run **until** options to execute and continue so the  job is running until it reach a certain component then stop.
- **`undo`** run undo on each component in both forward and backward order.
- **`reset`** set initial state, rerun the job after reset. 

##### Install
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

##### Running the Tests
````
npm test
```` 

>TxJS is a collection of classes you enable to build an application under nodejs as a set of *components* which communicate between then by *mount-points*.
A component is a regular [TypeSript](https://www.typescriptlang.org/) class which expose no API. It receive it's commands by a RxJS's Subject next / subscribe..

### The main classes are:

- **TxMountPoint** 
    - a class enable two ways communication between any two components.
    - it include two RxJS subjects one for *tasks* and other for *reply*.
    
    Defining a mount point is as:   
    ````typscript    
    // get a new mount-point under the name 'GITHUB::GIST::C2' and save on the registry
    mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C2');    
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

        
- **TxJob**
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
- **TxTask** 
    - is a simple class include three members 'method', 'status' and 'data'.
    - the task object is travel around all taksks / reply between components.
        
##API

----
###**`TxJob::execute`** 
Run all component one after the other, TxTask is passing between components, the output of a component is the input of 
the next component.

####arguments
- *TxTask*: an object including your data
- options: a directive to execute 
  - *until*: **{util: 'GITHUB::GIST::C2'}** run until component GITHUB::GIST::C2 then stop.
  use continue to resume the process. 

####usage

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

###**`TxJob::continue`** 
Continue running the job from it's current state, this is useful when rebuild the Job with **`upJSON`** (deserialize)

####arguments
- *TxTask*: an object including your data 

####usage

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

###**`TxJob::step`** 
Run the job's components step by step.

####arguments
- *TxTask*: an object including your data passing to each component separately.  

####usage

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

###**`TxJob::reset`** 
Return the job to it's initial state so it can run again.

####usage

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
  
  

