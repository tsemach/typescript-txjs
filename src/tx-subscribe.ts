
import { TxCallback } from './tx-callback';

export class TxSubscribe<T> {
  dataCB: TxCallback<T> = null;
  errorCB: TxCallback<T> = null;
  completeCB: TxCallback<T>;
  from: T = null;
  limit = 0;

  constructor(from?: T, limit = 0) {
    this.from = from ? from : null;    
    this.limit = limit;
  }

  subscribe(dataCB: TxCallback<T>, errorCB?: TxCallback<T>, completeCB?: (any?: any) => void) {  
    this.dataCB = dataCB;
    this.errorCB = errorCB;
    this.completeCB = completeCB;

    return this;
  }

  next(data, from?: T) {
    if (this.dataCB != null) {      
      this.dataCB(data, from ? from : this.from);
    }
  }

  error(error, from?: T) {
    if (this.errorCB != null) {    
      this.errorCB(error, from ? from : this.from);
    }
  }

  unsubscribe() {
    this.dataCB = null;
    this.errorCB = null;
    this.completeCB = null
  }

  setFrom(from: T) {
    this.from = from;
  }
}

