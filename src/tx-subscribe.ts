
export type TxCallback = (any: any) => void;

export class TxSubscribe {
  dataCB: TxCallback = null;
  errorCB: TxCallback = null;

  subscribe(dataCB: (any: any) => void, errorCB?: (any: any) => void) {
    this.dataCB = dataCB;
    this.errorCB = errorCB;

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
