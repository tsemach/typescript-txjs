import { Subject } from "rxjs";
import { TxTask } from "./tx-task";
import { TxCallback } from "./tx-callback";

export class TxSubject<T> extends Subject<TxTask<any>> {
  private methods = new Map<string, any>();
  isSubscribe = false;
  from: T = null;

  constructor() {
    super();
  }

  methodOld(name: string, target: any) {
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

  /**
   * two cases:
   * 1) name is string - then task.head.method => point to dataCB.
   * 2) name is [dataCB, errorCB] then:
   *    task.head.method[0] => point to dataCB.
   *    task.head.method[1] => point to errorCB.
   */
  method(name: string | string[], target: any, errorCB?: any) {
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
      this.isSubscribe = true;
      this.subscribe(dataCB, errorCB);
    }
  }

  setCallbacks(dataCB: any, errorCB?: any) {
    return this.subscribe(dataCB, errorCB);  
  }

  private isNamesArray(names: any): boolean {
    return Array.isArray(names) && names.length > 0 && names.every(item => typeof item === "string");
  }

  setFrom(from: T) {
    this.from = from;
  }
}
