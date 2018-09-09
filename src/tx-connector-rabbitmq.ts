import { injectable, inject } from "inversify";
import "reflect-metadata";
import * as uuid from 'uuid/v4';

import { TxConnector } from "./tx-connector"

@injectable()
export class TxConnectorRabbitMQ implements TxConnector {
  subscribeBC: (any) => void;

  id = uuid();
  constructor() {

  }
  connect(service: any, route: any) {
    console.log(`TxConnectorRabbit: ${service}-${route}-${this.id}`);
  }

  subscribe(cb: (any) => void) {
    this.subscribeBC = cb;
    console.log("subscribe: TxConnectorRabbit Method not implemented.");
  };

  next(any: any) {
    this.subscribeBC(any);
    console.log("next: TxConnectorRabbit Method not implemented.");
  }
}
