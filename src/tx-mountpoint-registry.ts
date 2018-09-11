//import logger = require('logging');
import createLogger from 'logging';
 
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxMountPoint } from './tx-mountpoint';
import { TxMountPointRxJS } from './tx-mount-point-rxjs';
import { TxQueuePoint } from "./tx-queuepoint";
import { TxRoutePoint } from "./tx-route-point";
import { Container } from "inversify";
import { TxTYPES } from "./tx-injection-types";
import { TxConnector } from "./tx-connector";
import { TxConnectorRabbitMQ } from "./tx-connector-rabbitmq";
import { TxConnectorExpress } from "./tx-connector-express";

/**
 * a wrapper class for inversify container to keep driver bind.
 */
class TxMountPointRegistryContainer<T> {
  // a container for TxConnector injection
  txContainer = new Container();
  bind: any;

  // set the bind to himself.
  constructor(type, bind) {
    this.txContainer.bind<T>(bind).to(type);
    this.bind = bind;
  }

  get() {
    return this.txContainer.get<T>(this.bind);
  }

  setDriver(type) {
    if ( this.txContainer.isBound(TxTYPES.TxConnector)) {
      this.txContainer.unbind(TxTYPES.TxConnector);
    }
    this.txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(type);
  }
}

export class TxMountPointRegistry extends TxRegistry<TxMountPoint, string | Symbol> {
  private static _instance: TxMountPointRegistry;

  private queueContainer = new TxMountPointRegistryContainer<TxQueuePoint>(TxQueuePoint, TxTYPES.TxQueuePoint);
  private routeContainer = new TxMountPointRegistryContainer<TxRoutePoint>(TxRoutePoint, TxTYPES.TxRoutePoint);

  private constructor() {
    super();

    // set default driver for rabbitMQ and express.
    this.queueContainer.setDriver(TxConnectorRabbitMQ);
    this.routeContainer.setDriver(TxConnectorExpress);
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  create(name: string | Symbol) {
    const mp = new TxMountPointRxJS(name);

    if (typeof name === 'string') {
      if (name === undefined || name.length === 0) {
        return mp;
      }
      return this.add(name, mp);
    }

    if (name === undefined) {
      return mp;
    }
    return this.add(name, mp);
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

  route(name: string | Symbol) {
    const cp = this.routeContainer.get();
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

  setQueueDriver(type) {
    this.queueContainer.setDriver(type);
  }

  setRouteDriver(type) {
    this.routeContainer.setDriver(type);
  }
}
