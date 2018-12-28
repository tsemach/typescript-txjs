
[![NPM](https://nodei.co/npm/rx-txjs.png)](https://nodei.co/npm/rx-txjs/)
[![dependencies Status](https://david-dm.org/tsemach/typescript-txjs/status.svg)](https://david-dm.org/tsemach/typescript-txjs)

# Application Execution Model

## Documentation
## Full document is now [here](https://rxjs.gitbook.io/rx-txjs/) 

##Introduction
This package implement an execution model based on decoupling objects (a *Components*) in a Nodejs environment. 

A Components are regular class (better it to be TypeScript class) which implement a small piece of business unit. But the unique is that there is NO API running it implementation. 
>**The way to interact with a Component is by sending it a message**

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

## What's new 0.2.3
1. adding **`TxSubscribe`** - an implement of RxJS Subject API.
2. adding **`TxSubject`** - a wrapper around RxJS Subject to support a type of RPC on a Componet. 
3. adding **`TxConnectorExpress`** - Coomponent-2-Component communication using subscribe / next API.

## DOTO List
1. Complete the work on S2S using node express (HTTP)
2. Run Componets in paralle.
3. Adding retry when execute a component (during job exection)
4. High availablity - on component level. 
   
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

