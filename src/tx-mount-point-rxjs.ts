import { Subject } from 'rxjs/Subject'
import { TxMountPoint } from "./tx-mountpoint";

/**
 * TxMountPoint: class is usually used by a component. 

It is a meeting point between two totally different components.
It support two communication between components.

A component receive task by the mount-point's tasks Subject and return reply by reply subject.     
 */
export class TxMountPointRxJS implements TxMountPoint {

  _tasks = new Subject();
  _reply = new Subject();
  _undos = new Subject();

  constructor(private _name: string | Symbol) {
  }

  get name() {
    if (typeof this._name === 'string') {
      return this._name;
    }
    return this._name.toString();
  }

  reply() {
    return this._reply;
  }

  tasks() {
    return this._tasks;
  }

  undos() {
    return this._undos;
  }

}

