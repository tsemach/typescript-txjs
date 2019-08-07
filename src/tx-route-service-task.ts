import * as express from 'express';

import { TxTask } from './tx-task';
import { TxRouteServiceExpress } from './tx-route-service-express';

export class TxRouteServiceTask<T> extends TxTask<T> {  
  private _req: express.Request;
  private _res: express.Response;
  private _service: TxRouteServiceExpress<any, any>;

  constructor(head: T, data={}, protected _reply?: TxRouteServiceExpress<any, any>) {   
    super(head, data)
  }

  get request() {
    return this._req;  
  }

  set request(_req: express.Request) {
    this._req = _req;
  }

  setRequest(_req: express.Request) {
    this._req = _req;

    return this;
  }

  get response() {
    return this._res;
  }  

  set respone(_res: express.Response)  {
    this._res = _res;
  }  

  setRespone(_res: express.Response)  {
    this._res = _res;

    return this;
  }  

  setService(_service: TxRouteServiceExpress<any, any>) {
    this._service = _service;

    return this;
  }

  reply() {
    return this;
  }

  next(task: TxRouteServiceTask<any>) {
    if ( ! this._service ) {
      throw Error('[TxRouteServiceTask::reply] _service is null, use this.setService to initiate')
    }

    this._service.send(this, task);
  }
  
  set(head: T, data: any) {
    this.head = head;
    this.data = data;

    return this;
  }

}