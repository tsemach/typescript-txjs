import * as express from 'express';

import { TxRouteService } from "./tx-route-service";
import { TxRouteServiceConfig } from "./tx-route-service-config";

export class TxRouteApplication {  
  
  public app: express.Application;
  
  constructor(app: express.Application) { 
    this.app = app;
  }

  /**
   * @param where - thed of which the service is route (regular express path)
   * @param service - a class which implement this route
   * @param config - service configuration need to return to add call
   */
  register(where: string, service: TxRouteService, config: TxRouteServiceConfig) { 
    this.app.use(where, service.add(config));
  }

}
