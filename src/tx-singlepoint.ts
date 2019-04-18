import { TxTask } from './tx-task';

import { TxSubscribe } from './tx-subscribe';
import { TxMountPoint } from "./tx-mountpoint";
import { TxDoublePoint } from './tx-doublepoint';
import { TxCallback } from './tx-callback';

export class TxSingleSubscribe<T> extends TxSubscribe<T> {
  private methods = new Map<string, any>();
  isSubscribe = false;

  constructor(from?: T) {
    super(from);
  }
  
  methodOld(name: string, target: any) {
    this.methods.set(name, target);    
    
    if ( ! this.isSubscribe ) {
      const dataCB = (task: TxTask<any>) => {
        if ( ! this.methods.has(task.head.method) ) {
          throw new Error(`method ${task.head.method} can't find in target object`);
        }

        let object = this.methods.get(task.head.method);
        object[task.head.method](task);
      }
      
      return this.subscribe(dataCB);
    }
    this.isSubscribe = true;
  }

  /**
   * two cases:
   * 1) name is string - then task.head.method => point to dataCB.
   * 2) name is [dataCB, errorCB] then:
   *    task.head.method[0] => point to dataCB.
   *    task.head.method[1] => point to errorCB.
   */
  method(name: string | string[], target: any, errorCB?: TxCallback<T>) {
    if (typeof name === 'string') {
      this.methods.set(name, target);      
    }
    if (this.isNamesArray(name)) {
      (<string[]>name).forEach(n => this.methods.set(n, target));
    }
    
    if ( ! this.isSubscribe ) {
      const dataCB = (task: TxTask<any>) => {
        if ( ! this.methods.has(task.head.method) ) {
          throw new Error(`method ${task.head.method} can't find in target object`);
        }

        let object = this.methods.get(task.head.method);
        object[task.head.method](task);
      }

      return this.subscribe(dataCB, errorCB);
    }
    this.isSubscribe = true;
  }

  setCallbacks(dataCB: TxCallback<T>, errorCB?: TxCallback<T>) {
    return this.subscribe(dataCB, errorCB);  
  }

  private isNamesArray(names: any): boolean {
    return Array.isArray(names) && names.length > 0 && names.every(item => typeof item === "string");
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
export class TxSinglePoint<T> implements TxMountPoint {

  _tasks = new TxSingleSubscribe<T>();
  _undos = new TxSingleSubscribe<T>();
  
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

  setFrom(from: T) {
    this._tasks.setFrom(from);
    this._undos.setFrom(from);
  }

  double(suffix = '') {   
    return new TxDoublePoint(this, suffix);
  }
}

