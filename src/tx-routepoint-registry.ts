
import createLogger from 'logging';
const logger = createLogger('RoutePointRegistry');

import * as express from 'express';

import { TxRoutePoint } from "./tx-routepoint";
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxRouteServiceConfig } from './tx-route-service-config';
import { TxRouteApplication } from './tx-route-application';
import { TxPublisher } from './tx-publisher';
import { TxRoutpointIndicator } from './tx-routepint-indicator';

export class TxRoutePointRegistry<K extends string | Symbol> {
  private static _instance: TxRoutePointRegistry<string | Symbol>;
  private _application: TxRouteApplication;
  private _publisher: TxPublisher;

  private constructor() {
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  async get(name: string | Symbol) {    
    try {
      return TxMountPointRegistry.instance.get(name);
    }
    catch (e) {
      if (e.name === 'TxMountPointNotFoundException' && this._publisher) {
        // routepoint is not found in my registry try invoke the publisher
        // to search on other services.
        const indicator: TxRoutpointIndicator = await this._publisher.discover(name);
        if (indicator && indicator.config) {
          const rp = this.create(indicator.name, indicator.config);

          return rp;
        }
      }
      throw e;
    }
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
    
    const routepoint = this.create(name, config);
    if (this._publisher) {
      this._publisher.publish(name.toString(), config);
    }

    return routepoint;
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

  has(name: string | Symbol) {
    return TxMountPointRegistry.instance.has(name);
  }

  del(name: string | Symbol) {      
    return TxMountPointRegistry.instance.del(name);
  }

  // setApplication(_application: TxRouteApplication) {
  setApplication(app: express.Application) {    
    this._application = new TxRouteApplication(app);
  }

  getApplication() {
    return this._application;
  }

  setPublisher(_publisher: TxPublisher) {
    this._publisher = _publisher;
  }

}
