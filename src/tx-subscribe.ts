
import { TxCallback } from './tx-callback';
import { TxTask } from './tx-task';
import { TxSubscribeOptions, defaultSubscribeOptions } from './tx-subscribe-options';

export class TxUnSubscribe<T> {
  from: TxSubscribe<T>;
  index: number

  constructor(from: TxSubscribe<T>, index: number) {
    this.from = from;
    this.index = index;
  }

  unsubscribe() {
    this.from.unsubscribe(this.index);
  }

  get subscribe() {
    return this.from;
  }
}

export class TxSubscribe<T> {
  dataCB = new Array<TxCallback<T>>();
  errorCB = new Array<TxCallback<T>>();
  completeCB = new Array<TxCallback<T>>();

  from: T = null;
  limit = 0;

  /**
   * 
   * @param from - object that use this subscribe
   * @param limit - limit the number of subscribers, 0 => unlimited
   */
  constructor(from?: T, limit = 0) {
    this.from = from ? from : null;    
    this.limit = limit;
  }

  subscribe(dataCB: TxCallback<T>, errorCB?: TxCallback<T>, completeCB?: (any?: any) => void) {  
    if (this.isLimit()) {    
      throw Error(`subscribe is over the limit [${this.limit}], unable to subscribe`)
    }
    
    this.dataCB.push(dataCB);
    this.errorCB.push(errorCB);
    this.completeCB.push(completeCB);

    return new TxUnSubscribe<T>(this, this.dataCB.length-1);
  }

  next(data: TxTask<any>, options: TxSubscribeOptions = defaultSubscribeOptions) {
    if (this.dataCB != null) {
      for (let i = 0; i < this.dataCB.length; i++) {
        this.dataCB[i](data, this.from, options);
      }
    }
  }

  error(error: TxTask<any>, options: TxSubscribeOptions = defaultSubscribeOptions) {
    if (this.errorCB != null) {    
      for (let i = 0; i < this.errorCB.length; i++) {
        this.errorCB[i](error, this.from, options);
      }
    }
  }  

  unsubscribe(index: number = -1) {
    if (index === -1) {
      this.dataCB.splice(0, this.dataCB.length);
      this.errorCB.splice(0, this.errorCB.length);
      this.completeCB.splice(0, this.completeCB.length);

      return;
    }

    if (index >= this.dataCB.length || index >= this.errorCB.length || index >= this.completeCB.length) {
      throw Error(`unsubscribe: illegal index [${index}] is larger then number of subscribes [${this.dataCB.length}]`);
    }

    this.dataCB.splice(index, 1);
    this.errorCB.splice(index, 1);
    this.completeCB.splice(index, 1);
  }

  setFrom(from: T) {
    this.from = from;
  }

  /**
   * return if nuber of subscribes in reach to its limit
   */
  private isLimit() {
    if (this.limit === 0) {
      return false;
    }
    
    if (this.dataCB.length >= this.limit || this.errorCB.length >= this.limit || this.completeCB.length >= this.limit) {    
      return true;
    }

    return false;
  }

  getSubscribesLength() {
    return [this.dataCB.length, this.errorCB.length, this.completeCB.length]
  }
}

