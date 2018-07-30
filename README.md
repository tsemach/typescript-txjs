## Application Execution Model
TxJS implement an execution model based on [RxJS](https://rxjs-dev.firebaseapp.com/) and [TypeSript](https://www.typescriptlang.org/).

##### Running the Tests
````
npm test
```` 

>TxJS is a collection of classes you enable to build an application under nodejs as a set of *components* which communicate between then by *mount-points*.
The component is a regular [TypeSript](https://www.typescriptlang.org/) class which expose no API. It receive it's commands by a RxJS Subject next / subscribe..

### The main classes are:

- **TxMountPoint** 
    - a class enable two way communication between any two component.
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
        
         

    
  
  

