
import createLogger from 'logging';
const logger = createLogger('RoutePointRegistry');

import { TxRoutePoint } from "./tx-routepoint";
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxRouteServiceConfig } from './tx-route-service-config';
import { TxRouteApplication } from './tx-route-application';

export class TxRoutePointRegistry<K extends string | Symbol> {
  private static _instance: TxRoutePointRegistry<string | Symbol>;
  private _application: TxRouteApplication;

  private constructor() {
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  // if call directly from client then config.mode === 'client'
  // if called from this.route(..) then config.mode === 'server'
  create(name: string | Symbol, config: TxRouteServiceConfig = null) {
    const rp = new TxRoutePoint(name, config);

    if (typeof name === 'string') {
      if (name === undefined || name.length === 0) {
        return rp;
      }
      return TxMountPointRegistry.instance.add(name, rp);
    }

    if (name === undefined) {
      return rp;
    }

    TxMountPointRegistry.instance.add(name, rp, 'TxRoutePointRegistry');
    
    return rp;
  }

  // call on server side, need to set config.mode = 'server'
  // server side is the one that listen to upcoming request
  route(name: string | Symbol, config: TxRouteServiceConfig = null) {
    if (config) {
      config.mode = 'server';
    }

    return this.create(name, config);
    // const rp = new TxRoutePoint(name, config);

    // if (typeof name === 'string') {
    //   if (name === undefined || name.length === 0) {
    //     return rp;
    //   }
    //   return TxMountPointRegistry.instance.add(name, rp);
    // }

    // if (name === undefined) {
    //   return rp;
    // }

    // TxMountPointRegistry.instance.add(name, rp, 'TxRoutePointRegistry');
    
    // return rp;
  }

  setApplication(_application: TxRouteApplication) {
    this._application = _application;
  }

  getApplication() {
    return this._application;
  }
}
