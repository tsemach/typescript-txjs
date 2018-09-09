import { injectable, inject } from "inversify";
import "reflect-metadata";

import { TxConnector } from "./tx-connector"
import { TxTYPES } from "./tx-injection-types";

@injectable()
export class TxConnectPoint {
  @inject(TxTYPES.TxConnector) private _tasks: TxConnector;
  @inject(TxTYPES.TxConnector) private _reply: TxConnector;
  @inject(TxTYPES.TxConnector) private _undos: TxConnector;

  constructor(private _name = '') {
  }

  set name (_name) {
    if (this._name === '') {
      this._name = _name;
    }
  }

  get name() {
    return this._name;
  }

  reply() {
    return this._reply;
  }

  tasks() {
    return this._tasks;
  }

  undos() {
    return this._undos;
  }
}
