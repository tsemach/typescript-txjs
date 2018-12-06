import { TxCallback } from './tx-callback';
import { TxMountPoint } from './tx-mountpoint';

export class TxSubscribe {
  dataCB: TxCallback = null;
  errorCB: TxCallback = null;
  completeCB: TxCallback;

  constructor() {
  }

  subscribe(dataCB: TxCallback, errorCB?: TxCallback, completeCB?: (any?: any) => void) {
    this.dataCB = dataCB;
    this.errorCB = errorCB;
    this.completeCB = completeCB;

    return this;
  }

  next(data) {
    if (this.dataCB != null) {
      this.dataCB(data);
    }
  }

  error(error) {
    if (this.errorCB != null) {    
      this.errorCB(error);
    }
  }

  unsubscribe() {
    this.dataCB = null;
    this.errorCB = null;
  }

}
