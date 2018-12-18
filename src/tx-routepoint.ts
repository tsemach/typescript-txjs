import { injectable, inject } from "inversify";
import "reflect-metadata";

import * as uuid from 'uuid/v4';

import { TxConnector } from "./tx-connector"

import { TxTYPES } from "./tx-injection-types";
import { TxConnectorExpressService } from './tx-connector-express-service';
import { TxCallback } from "./tx-callback";

@injectable()
export class TxRoutePoint {
  @inject(TxTYPES.TxConnector) private _route: TxConnector;
  @inject(TxTYPES.TxPointName) private _name: string | Symbol = '';
  private _service: TxConnectorExpressService = null;

  id = uuid();
    
  constructor() {
  }

  get name() {
    return this._name;
  }

  //  */
  // route() {
  //   return this._route;
  // }

  listen(service: string, path: string) {
    this._service = this._route.listen(service, path);
  }

  subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: (any?: any) => void) {  
    this._service.subscribe(dataCB, errorCB, completeCB);

    return this;
  }

  async next(service: string, route: string, data: any) {
    await this._route.next(service, route, data);
  }

  close(service: string) {
    this._route.close(service);
  }
}
