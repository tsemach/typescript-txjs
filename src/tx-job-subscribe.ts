

// //import { TxCallback } from './tx-callback';
// import { TxTask } from './tx-task';
// import { TxJob } from './tx-job';

// export type TxJobCallback = (task: TxTask<any>, job: TxJob) => void;

// export class TxJobSubscribe {
//   dataCB: TxJobCallback = null;
//   errorCB: TxJobCallback = null;
//   completeCB: TxJobCallback;

//   constructor() {
//   }

//   subscribe(dataCB: TxJobCallback, errorCB?: TxJobCallback, completeCB?: (any?: any) => void) {
//     this.dataCB = dataCB;
//     this.errorCB = errorCB;
//     this.completeCB = completeCB;

//     return this;
//   }

//   next(task, job) {
//     if (this.dataCB != null) {
//       this.dataCB(task, job);
//     }
//   }

//   error(error, job) {
//     if (this.errorCB != null) {    
//       this.errorCB(error, job);
//     }
//   }

//   unsubscribe() {
//     this.dataCB = null;
//     this.errorCB = null;
//   }

// }



//import { TxCallback } from './tx-callback';
import { TxTask } from './tx-task';
import { TxJob } from './tx-job';

export type TxJobCallback<T>= (task: TxTask<any>, from: T) => void;

/**
 * @deprecated
 */
export class TxJobSubscribe<T> {
  dataCB: TxJobCallback<T> = null;
  errorCB: TxJobCallback<T> = null;
  completeCB: TxJobCallback<T>;

  constructor() {
  }

  subscribe(dataCB: TxJobCallback<T>, errorCB?: TxJobCallback<T>, completeCB?: (any?: any) => void) {
    this.dataCB = dataCB;
    this.errorCB = errorCB;
    this.completeCB = completeCB;

    return this;
  }

  next(task, T) {
    if (this.dataCB != null) {
      this.dataCB(task, T);
    }
  }

  error(error, job) {
    if (this.errorCB != null) {    
      this.errorCB(error, job);
    }
  }

  unsubscribe() {
    this.dataCB = null;
    this.errorCB = null;
  }

}