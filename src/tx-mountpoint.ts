import { Subject } from 'rxjs/Subject'

/**
 * TxMountPoint: class is usually used by a component. 

It is a meeting point between two totally different components.
It support two communication between components.

A component receive task by the mount-point's tasks Subject and return reply by reply subject.     
 */
export class TxMountPoint {

  _tasks = new Subject();
  _reply = new Subject();

  constructor(private _name: string) {        
  }

  get name() {
    return this._name
  }

  reply() {
    return this._reply;
  }

  tasks() {
    return this._tasks;
  }

}

