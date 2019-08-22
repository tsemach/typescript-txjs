// import { TxTask } from './tx-task';
// import { Subject } from 'rxjs/Subject'
import { TxSubject } from './tx-subject';
import { TxMountPoint } from "./tx-mountpoint";

// export class TxSubject<T> extends Subject<TxTask<any>> {
//   private methods = new Map<string, any>();
//   isSubscribe = false;
//   from: T = null;

//   constructor() {
//     super();
//   }

//   methodOld(name, target) {
//     this.methods.set(name, target);    
    
//     if ( ! this.isSubscribe ) {
//       this.subscribe((task) => {
//         if ( ! this.methods.has(task.head.method) ) {
//           throw new Error(`method ${task.head.method} can't find in target object`);
//         }

//         let object = this.methods.get(task.head.method);
//         object[task.head.method](task);
//       });
//     }
//     this.isSubscribe = true;
//   }

//   /**
//    * two cases:
//    * 1) name is string - then task.head.method => point to dataCB.
//    * 2) name is [dataCB, errorCB] then:
//    *    task.head.method[0] => point to dataCB.
//    *    task.head.method[1] => point to errorCB.
//    */
//   method(name: string | string[], target: any, errorCB?: TxCallback<T>) {
//     if (typeof name === 'string') {
//       this.methods.set(name, target);      
//     }
//     if (this.isNamesArray(name)) {
//       (<string[]>name).forEach(n => this.methods.set(n, target));
//     }
    
//     if ( ! this.isSubscribe ) {
//       const dataCB = (task: TxTask<any>) => {
//         if ( ! this.methods.has(task.head.method) ) {
//           throw new Error(`method ${task.head.method} can't find in target object`);
//         }

//         let object = this.methods.get(task.head.method);
//         object[task.head.method](task);
//       }

//       return this.subscribe(dataCB, errorCB);
//     }
//     this.isSubscribe = true;
//   }

//   setCallbacks(dataCB: TxCallback<T>, errorCB?: TxCallback<T>) {
//     return this.subscribe(dataCB, errorCB);  
//   }

//   private isNamesArray(names: any): boolean {
//     return Array.isArray(names) && names.length > 0 && names.every(item => typeof item === "string");
//   }

//   setFrom(from: T) {
//     this.from = from;
//   }
// }

/**
 * TxMountPoint: class is usually used by a component. 
 *
 * It is a meeting point between two totally different components.
 * It support two communication between components.
 *
 * A component receive task by the mount-point's tasks Subject and return reply by reply subject.
 */
export class TxMountPointRxJS<T> implements TxMountPoint {
   type = 'TxMountPointRxJS';

  _tasks = new TxSubject<T>();
  _reply = new TxSubject<T>();
  _undos = new TxSubject<T>();

  constructor(private _name: string | Symbol) {    
  }

  get name() {
    if (typeof this._name === 'string') {
      return this._name;
    }
    return this._name.toString();
  }

  /**
   * Use this subject to send back reply of some tasks.
   * @returns {TxSubject<any>}
   */
  reply(): TxSubject<T> {
    return this._reply;
  }

  /**
   * Use this subject to receive some task to do
   * then reply on the reply subject about the result.
   * @returns {TxSubject<TxTask<any>>}
   */
  tasks(): TxSubject<T> {
    return this._tasks;
  }

  undos(): TxSubject<T> {
    return this._undos;
  }

  setFrom(from: T) {
    this._tasks.setFrom(from);
    this._reply.setFrom(from);
    this._undos.setFrom(from);    
  }

}

