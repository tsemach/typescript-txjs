
export class TxTask<T> {  
  head: T;
  data: any;

  constructor(head: T, data={}) {
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
  
}