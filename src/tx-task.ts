import { TxSinglePoint } from './tx-singlepoint';

export class TxTask<T> {  
  head: T;
  data: any;

  constructor(head: T, data={}, private _reply?: TxSinglePoint) {
    this.head = head; 
    this.data = data;
  }

  getHead() {
    return this.head;
  }

  setHead(head) {
    this.head = head;
  }

  getdata() {
    return this.data;
  }

  setData(data) {
    this.data = data;
  }
  
  setReply(_reply: TxSinglePoint) {
    this._reply = _reply;
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