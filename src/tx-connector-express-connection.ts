import { TxCallback } from './tx-callback'

export class TxConnectorExpressConnection {  
  private _host: string = null
  private _port: string = null
  private _path: string = null

  constructor() {
  }

  get host() {
    return this._host
  }

  get port() {
    return this._port
  }

  get path() {
    return this._path
  }

  set host(_host: string) {
    this._host = _host
  }

  set port(_port: string) {
    this._port = _port
  }

  set path(_path: string) {
    this._path = _path
  }

  isDefined():boolean {
    return this.host !== null && this.port !== null && this.path !== null
  }

  parse(service, path) {
    this.host = service.split(':')[0];
    this.port = service.split(':')[1];
    this.path = path;
  }

  getUrl(): string {
    return `http://${this.host}:${this.port}/`;
  }

  getFullUrl() {
    return `http://${this.host}:${this.port}/${this.path}`;
  }

  getService() {
    return this.host + ':' + this.port;
  }

}