
//export type TxCallback = (any: any) => void;
import { TxCallback } from './tx-callback';

export class TxSubscribe {
  dataCB: TxCallback = null;
  errorCB: TxCallback = null;
  completeCB: TxCallback

  subscribe(dataCB: (any: any) => void, errorCB?: (any: any) => void, completeCB?: (any?: any) => void) {
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
