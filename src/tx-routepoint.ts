import { injectable, inject } from "inversify";
import "reflect-metadata";

import * as uuid from 'uuid/v4';

import { TxConnector } from "./tx-connector"

import { TxTYPES } from "./tx-injection-types";
import { TxConnectorExpressService } from './tx-connector-express-service';
import { TxCallback } from "./tx-callback";
import { TxConnectorConnection } from "./tx-connector-connection";

@injectable()
export class TxRoutePoint {
  @inject(TxTYPES.TxConnector) private _route: TxConnector;
  @inject(TxTYPES.TxPointName) private _name: string | Symbol = '';
  private _service: TxConnectorExpressService = null;
  private _connection = new TxConnectorConnection();

  id = uuid();

  constructor() {
  }

  get name() {
    return this._name;
  }

  listen(service: string, path: string) {
    this._service = this._route.listen(service, path);
    this._connection.parse(service, path);

    return this._service;
  }

  subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: (any?: any) => void) {  
    this._service.subscribe(dataCB, errorCB, completeCB);

    return this;
  }

  async next(service: string, route: string, data: any) {
    await this._route.next(service, route, data);
  }

  close() {
    this._route.close(this._connection.service, this._connection.path);
  }

}
