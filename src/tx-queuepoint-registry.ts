//import logger = require('logging');
import createLogger from 'logging';
 
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxQueuePoint } from "./tx-queuepoint";
import { TxTYPES } from "./tx-injection-types";
import { TxConnectorRabbitMQ } from "./tx-connector-rabbitmq";
import { TxRegistryContainer } from "./tx-registry-container";

// /**
//  * a wrapper class for inversify container to keep driver bind.
//  */
// class TxQueuePointRegistryContainer<T> {
//   // a container for TxConnector injection
//   txContainer = new Container();
//   bind: any;
//
//   // set the bind to himself.
//   constructor(type, bind) {
//     this.txContainer.bind<T>(bind).to(type);
//     this.bind = bind;
//   }
//
//   get() {
//     return this.txContainer.get<T>(this.bind);
//   }
//
//   setDriver(type) {
//     if ( this.txContainer.isBound(TxTYPES.TxConnector)) {
//       this.txContainer.unbind(TxTYPES.TxConnector);
//     }
//     this.txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(type);
//   }
// }

export class TxQueuePointRegistry extends TxRegistry<TxQueuePoint, string | Symbol> {
  private static _instance: TxQueuePointRegistry;

  //private queueContainer = new TxQueuePointRegistryContainer<TxQueuePoint>(TxQueuePoint, TxTYPES.TxQueuePoint);
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
    const cp = this.queueContainer.get();
    cp.name = name;

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
