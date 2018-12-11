
import { TxTask } from './tx-task';
import { Subject } from 'rxjs/Subject'
import { TxMountPoint } from "./tx-mountpoint";

export class TxSingleSubjectRxJS extends Subject<TxTask<any>> {
  private methods = new Map<string, any>();
    isSubscribe = false;

  constructor() {
    super();
  }

  method(name, target) {
    this.methods.set(name, target);    
    
    if ( ! this.isSubscribe ) {
      this.subscribe((task) => {
        if ( ! this.methods.has(task.head.method) ) {
          throw new Error(`method ${task.head.method} can't find in target object`);
        }

        let object = this.methods.get(task.head.method);
        object[task.head.method](task);
      });
    }
    this.isSubscribe = true;
  }

}

/**
 * TxMountPoint: class is usually used by a component. 
 *
 * It is a meeting point between two totally different components.
 * It support two communication between components.
 *
 * A component receive task by the mount-point's tasks Subject and return reply by reply subject.
 */
export class TxSinglePointRxJS implements TxMountPoint {

  _tasks = new TxSingleSubjectRxJS();
  _undos = new TxSingleSubjectRxJS();

  constructor(private _name: string | Symbol) {    
  }

  get name() {
    if (typeof this._name === 'string') {
      return this._name;
    }
    return this._name.toString();
  }

  /**
   * Reply is allow using TxSinglePoint.
   * @returns TxSingleSubject
   */
  reply() {
    throw new Error("reply is not allow on TxSinglePoint");
    //return this._tasks;
  }

  /**
   * Use this subject to receive some task to do
   * then reply on the reply subject about the result.
   * @returns TxSingleSubject
   */
  tasks() {
    return this._tasks;
  }

  undos() {
    return this._undos;
  }

}

