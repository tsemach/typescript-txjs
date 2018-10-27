//import logger = require('logging');
import createLogger from 'logging';
 
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxQueuePoint } from "./tx-queuepoint";
import { TxTYPES } from "./tx-injection-types";
import { TxConnectorRabbitMQ } from "./tx-connector-rabbitmq";
import { TxRegistryContainer } from "./tx-registry-container";

export class TxQueuePointRegistry extends TxRegistry<TxQueuePoint, string | Symbol> {
  private static _instance: TxQueuePointRegistry;

  private queueContainer = new TxRegistryContainer<TxQueuePoint>(TxQueuePoint, TxTYPES.TxQueuePoint);

  private constructor() {
    super();

    // set default driver for rabbitMQ and express.
    this.queueContainer.setDriver(TxConnectorRabbitMQ);
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  queue(name: string | Symbol) {
    const cp = this.queueContainer.get(name);

    if (typeof name === 'string') {
      if (name === undefined || name.length === 0) {
        return cp;
      }
      return this.add(name, cp);
    }

    if (name === undefined) {
      return cp;
    }
    return this.add(name, cp);
  }

  setDriver(type) {
    this.queueContainer.setDriver(type);
  }

}
