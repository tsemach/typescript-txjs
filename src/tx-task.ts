
export class TxTask<T> {  
  head: T;
  data: any;
  
  //constructor(head: T, data={}, protected _reply?: TxSingleSubscribe<any>) {
  constructor(head: T, data={}, protected _reply?: any) {
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
  
  setReply(_reply: any) {
    this._reply = _reply;
    
    return this;
  }

  reply() {
    if ( ! this._reply ) {
      throw Error('[TxTask::reply] reply is null, add reply object in the constructor')
    }
    return this._reply;
  }

  isReply() {
    return this._reply !== null && this._reply !== undefined;
  }

  get() {
    return {
      head: this.head,
      data: this.data
    }
  }

  set(head: T, data: any) {
    this.head = head;
    this.data = data;

    return this;
  }
}