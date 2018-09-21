import { injectable, inject } from "inversify";
import "reflect-metadata";
import * as uuid from 'uuid/v4';

import { TxConnector } from "./tx-connector"

/**
 * C2C - part of component-2-component communication.
 * use as default TxConnector implementation for express routes.
 */
@injectable()
export class TxConnectorExpress implements TxConnector {
  subscribeBC: (any) => void;

  id = uuid();
  constructor() {

  }
  register(service: any, route: any) {
    console.log(`TxConnectorExpress: ${service}-${route}-${this.id}`);
  }

  subscribe(cb: (any) => void) {
    this.subscribeBC = cb;
    console.log("subscribe: TxConnectorExpress Method not implemented.");
  };

  next(any: any) {
    this.subscribeBC(any);
    console.log("next: TxConnectorExpress Method not implemented.");
  }

  close() {
  }
}
