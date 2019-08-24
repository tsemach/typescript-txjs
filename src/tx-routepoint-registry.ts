
import createLogger from 'logging';
const logger = createLogger('RoutePointRegistry');

import * as express from 'express';

import { TxRoutePoint } from "./tx-routepoint";
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxRouteServiceConfig } from './tx-route-service-config';
import { TxRouteApplication } from './tx-route-application';
import { TxPublisher } from './tx-publisher';
import { TxRoutpointIndicator } from './tx-routepint-indicator';
import { TxMountPointNotFoundException } from './tx-mountpoint-exception';
import { TxMountPoint } from './tx-mountpoint';

export class TxRoutePointRegistry<K extends string | Symbol> {
  private static _instance: TxRoutePointRegistry<string | Symbol>;
  private _application: TxRouteApplication;
  private _publisher: TxPublisher;
  private cname: string;

  private constructor() {
    this.cname = this.constructor.name;
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  // private adject(routepoint: TxMountPoint) {   

  //   if (routepoint.constructor.name === 'TxRoutePoint') {
  //     const origin = <TxRoutePoint>routepoint;
  //     const rp = new TxRoutePoint(origin.name, origin.getConfig());
      
  //     return (new TxRoutePoint(origin.name, origin.getConfig())).adjust(origin);
  //   }

  //   return routepoint;
  // }

  async get(name: string | Symbol) {        
    if (TxMountPointRegistry.instance.has(name)) {
      const rp = <TxRoutePoint>TxMountPointRegistry.instance.get(name)

      return (new TxRoutePoint(rp.name, rp.getConfig())).adjust(rp);
    }
    
    // routepoint is not found in my registry try invoke the publisher
    // to search on other services.
    const indicator: TxRoutpointIndicator = await this._publisher.discover(name);
    if (indicator && indicator.config) {
      const rp = this.create(indicator.name, indicator.config);

      return rp;
    }
    throw new TxMountPointNotFoundException(`[${this.cname}:get] object '${name.toString()}' is not exist in the registry`);
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
  }

  has(name: string | Symbol) {
    return TxMountPointRegistry.instance.has(name);
  }

  del(name: string | Symbol) {      
    return TxMountPointRegistry.instance.del(name);
  }
  
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
