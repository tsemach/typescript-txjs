import { injectable, inject } from "inversify";
import "reflect-metadata";

import { TxConnector } from "./tx-connector"
import { TxTYPES } from "./tx-injection-types";

@injectable()
export class TxRoutePoint {
  @inject(TxTYPES.TxConnector) private _route: TxConnector;
  @inject(TxTYPES.TxPointName) private _name: string | Symbol = '';
  
  constructor() {
  }

  get name() {
    return this._name;
  }

  route() {
    return this._route;
  }
}
