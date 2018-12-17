//import logger = require('logging');
import createLogger from 'logging';
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxRoutePoint } from "./tx-routepoint";
import { TxTYPES } from "./tx-injection-types";
import { TxConnectorExpress } from "./tx-connector-express";
import { TxRegistryContainer, TxRegistryContainerScopeEnum } from "./tx-registry-container";

export class TxRoutePointRegistry extends TxRegistry<TxRoutePoint, string | Symbol> {
  private static _instance: TxRoutePointRegistry;

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

  /**
   * TxRegistryContainerScopeEnum.TRANSIENT - mean create new instence on every get.
   * @param type 
   */
  setDriver(type) {
    this.routeContainer.setDriver(type, TxRegistryContainerScopeEnum.TRANSIENT);
  }
}
