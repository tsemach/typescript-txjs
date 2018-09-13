//import logger = require('logging');
import createLogger from 'logging';
 
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxMountPoint } from './tx-mountpoint';
import { TxMountPointRxJS } from './tx-mount-point-rxjs';
import { TxQueuePoint } from "./tx-queuepoint";
import { TxRoutePoint } from "./tx-routepoint";
import { Container } from "inversify";
import { TxTYPES } from "./tx-injection-types";
import { TxConnector } from "./tx-connector";
import { TxConnectorRabbitMQ } from "./tx-connector-rabbitmq";
import { TxConnectorExpress } from "./tx-connector-express";

export class TxMountPointRegistry extends TxRegistry<TxMountPoint, string | Symbol> {
  private static _instance: TxMountPointRegistry;
    
  private constructor() {
    super();
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  create(name: string | Symbol): TxMountPoint {
    const mp = new TxMountPointRxJS(name);

    if (typeof name === 'string') {
      if (name === undefined || name.length === 0) {
        return mp;
      }
      return <TxMountPoint>this.add(name, mp);
    }

    if (name === undefined) {
      return mp;
    }
    return <TxMountPoint>this.add(name, mp);
  }
    
}
