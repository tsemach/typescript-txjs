import { injectable, inject } from "inversify";
import "reflect-metadata";

import { TxConnector } from "./tx-connector"
import { TxTYPES } from "./tx-injection-types";

@injectable()
export class TxRoutePoint {
  @inject(TxTYPES.TxConnector) private _route: TxConnector;

  constructor(private _name: string | Symbol = '') {
  }

  set name (_name: string | Symbol) {
    if (this._name === '') {
      this._name = _name;
    }
  }

  get name() {
    return this._name;
  }

  route() {
    return this._route;
  }
}
