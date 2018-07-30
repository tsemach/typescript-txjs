
export class TxTask {
  method: string;
  status: string;
  data: any;

  constructor(method='', status='', data={}) {
    this.method = method;
    this.status = status;
    this.data = data;
  }

  getMethod() {
    return this.method;
  }

  setMethod(_method) {
    this.method =_method;
  }

  getStatus() {
    return this.status;
  }

  setStatus(_status) {
    this.status = this.status;
  }

  getData() {
    return this.data;
  }

  setData(data) {
    this.data = data;
  }
  
}