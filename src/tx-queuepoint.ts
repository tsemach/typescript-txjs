import { injectable, inject } from "inversify";
import "reflect-metadata";

import { TxConnector } from "./tx-connector"
import { TxTYPES } from "./tx-injection-types";
import { TxMountPoint } from "./tx-mountpoint";

@injectable()
export class TxQueuePoint {

  @inject(TxTYPES.TxConnector) private _queue: TxConnector;
  @inject(TxTYPES.TxPointName) private _name: string | Symbol = '';

  //constructor(private _name: string | Symbol = '') {
  constructor() {
  }

  // set name (_name: string | Symbol) {
  //   if (this._name === '') {
  //     this._name = _name;
  //   }
  // }

  get name() {
    return this._name;
  }

  queue() {
    return this._queue;
  }

}
