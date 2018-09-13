//import logger = require('logging');
import createLogger from 'logging';
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxRoutePoint } from "./tx-routepoint";
import { TxTYPES } from "./tx-injection-types";
import { TxConnectorExpress } from "./tx-connector-express";
import { TxRegistryContainer } from "./tx-registry-container";

// /**
//  * a wrapper class for inversify container to keep driver bind.
//  */
// class TxMountPointRegistryContainer<T> {
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

export class TxRoutePointRegistry extends TxRegistry<TxRoutePoint, string | Symbol> {
  private static _instance: TxRoutePointRegistry;

  //private routeContainer = new TxMountPointRegistryContainer<TxRoutePoint>(TxRoutePoint, TxTYPES.TxRoutePoint);
  private routeContainer = new TxRegistryContainer<TxRoutePoint>(TxRoutePoint, TxTYPES.TxRoutePoint);

  private constructor() {
    super();

    // set default driver for rabbitMQ and express.
    this.routeContainer.setDriver(TxConnectorExpress);
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  route(name: string | Symbol) {
    const cp = this.routeContainer.get(name);
    //cp.name = name;

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
    this.routeContainer.setDriver(type);
  }
}
