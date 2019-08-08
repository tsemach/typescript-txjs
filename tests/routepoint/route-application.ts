import createLogger from 'logging';
const logger = createLogger('RouteApplication');

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { TxRouteService } from '../../src/tx-route-service';
import { TxRouteServiceConfig  } from '../../src/tx-route-service-config';
import { TxRouteApplication } from '../../src/tx-route-application';

class RouteApplication {  
  private static _instance: RouteApplication = null;
  public express: express.Application;
  
  constructor() { 
    logger.info("[RouteApplication::construcot] is called")
    this.express = express();
    this.middleware();    
  }

  public static get instance() {                                          
    return this._instance || (this._instance = new this());
  }                                                                          

  // configure express middleware.
  private middleware(): void {
    //this.express.use(logger);
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: false}));
  }

  /**
   * @param where - thed of which the service is route (regular express path)
   * @param service - a class which implement this route
   * @param config - service configuration need to return to add call
   */
  register(where: string, service: TxRouteService, config: TxRouteServiceConfig) {
    logger.info("[RouteApplication:register] going to add service path on:" + where);
    this.express.use(where, service.add(config));
  }

  listen(host: string, port: number, callback = () => {
      // default callback
      logger.info(`[RouteApplication::listen] Listening at http://${host}:${port}/`);
    })
  {    
    this.express.listen(port, callback);
  }

  close() {
    (<any>this.express).close();
  }
}

export default RouteApplication;

//export default // let application = new Application();

// const port: number = 3000;

// application.express.listen(port, () => {
//     // success callback;
//     logger.info(`Listening at http://localhost:${port}/`);
// });

