import * as express from 'express';

import { TxRouteServiceConfig } from './tx-route-service-config';
import { TxSubscribe } from './tx-subscribe';
import { TxRouteServiceTask } from './tx-route-service-task';
import { TxCallback } from './tx-callback';
import { TxTask } from './tx-task';

export abstract class TxRouteServiceExpress<H, D> {    
  protected callbacks = new TxSubscribe<this>();  

  constructor(protected config: TxRouteServiceConfig) {    
  }
  
  set name(name: string) {
    this.callbacks.name = name;
  }

  get name() {
    return this.callbacks.name;
  }
  
  setFrom(from: any) {
    this.callbacks.setFrom(from);
  }

  /**
   * client side: client want to get callback when data is coming from server
   * 
   * @param dataCB - callback to all, same goes for errorCB and completeCB
   */
  subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: TxCallback<any>) {
    return this.callbacks.subscribe(dataCB, errorCB, completeCB);
  }

  // this will call when user call to task.reply().next(..), it send reply by response onject 
  abstract send(from: TxRouteServiceTask<any>, task: TxRouteServiceTask<any>): void; // must be implemented in derived classes

  // this will use by client this.tasks().next(..) to send the task to other side (the receive side)
  abstract next(task: TxTask<any>): void; // must be implemented in derived classes  
}
