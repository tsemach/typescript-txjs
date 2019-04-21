import { TxMountPoint } from './tx-mountpoint';
import { TxSingleSubscribe } from './tx-singlepoint';

export class TxTask<T> {  
  head: T;
  data: any;
  
  constructor(head: T, data={}, private _reply?: TxSingleSubscribe<any>) {
    this.head = head; 
    this.data = data;
  }

  getHead() {
    return this.head;
  }

  setHead(head: any) {
    this.head = head;
  }

  getData() {
    return this.data;
  }

  setData(data: any) {
    this.data = data;
  }
  
  setReply(_reply: TxSingleSubscribe<any>) {
    this._reply = _reply;
    
    return this;
  }

  reply() {
    if ( ! this._reply ) {
      throw Error('[TxTask::reply] reply singlepoint is null, add reply object in the constructor')
    }
    return this._reply;
  }

  get() {
    return {
      head: this.head,
      data: this.data
    }
  }
}