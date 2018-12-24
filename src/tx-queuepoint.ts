import { injectable, inject } from "inversify";
import "reflect-metadata";

import { TxConnector } from "./tx-connector"
import { TxTYPES } from "./tx-injection-types";

@injectable()
export class TxQueuePoint {

  @inject(TxTYPES.TxConnector) private _queue: TxConnector;
  @inject(TxTYPES.TxPointName) private _name: string | Symbol = '';
  
  constructor() {
  }

  get name() {
    return this._name;
  }

  queue() {
    return this._queue;
  }

}
