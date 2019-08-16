import createLogger from 'logging';
const logger = createLogger('RouteApplication');

import * as express from 'express';
import * as http from 'http';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { TxRouteService } from '../../src/tx-route-service';
import { TxRouteServiceConfig  } from '../../src/tx-route-service-config';

class RouteApplication {  
  private static _instance: RouteApplication = null;
  public app: express.Application;
  private server: http.Server;
  
  constructor() { 
    logger.info("[RouteApplication::construcot] is called")
    this.app = express();
    this.middleware();    
  }

  public static get instance() {                                          
    return this._instance || (this._instance = new this());
  }                                                                          

  // configure express middleware.
  private middleware(): void {
    //this.express.use(logger);
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({extended: false}));
  }

  /**
   * @param where - thed of which the service is route (regular express path)
   * @param service - a class which implement this route
   * @param config - service configuration need to return to add call
   */
  register(where: string, service: TxRouteService, config: TxRouteServiceConfig) {
    logger.info("[RouteApplication:register] going to add service path on:" + where);
    this.app.use(where, service.add(config));
  }

  listen(host: string, port: number, callback = () => {
      // default callback
      logger.info(`[RouteApplication::listen] Listening at http://${host}:${port}/`);
    })
  {    
    this.server = this.app.listen(port, callback);
  }

  close() {
    this.server.close();
  }
}

export default RouteApplication;

//export default // let application = new Application();

// const port: number = 3000;

// application.express.listen(port, () => {
//     // success callback;
//     logger.info(`Listening at http://localhost:${port}/`);
// });

