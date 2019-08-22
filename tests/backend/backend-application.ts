import createLogger from 'logging';
const logger = createLogger('BackendApplication');

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { TxRouteService } from '../../src/tx-route-service';
import { TxRouteServiceConfig  } from '../../src/tx-route-service-config';
import { TxRouteApplication } from '../../src/tx-route-application';

class BackendApplication {  
  private static _instance: BackendApplication = null;
  public express: express.Application;
  
  constructor() { 
    console.log("[BackendApplication::construcot] is called")
    this.express = express();
    this.middleware();    
  }

  get app() {
    return this.express;
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
    console.log("[BackendApplication:register] going to add service path on:" + where);
    this.express.use(where, service.add(config));
  }

  listen(host: string, port: number, callback = () => {
      // default callback
      console.log(`[BackendApplication::listen] Listening at http://${host}:${port}/`);
    })
  {    
    this.express.listen(port, callback);
  }
}

export default BackendApplication;

//export default // let application = new Application();

// const port: number = 3000;

// application.express.listen(port, () => {
//     // success callback;
//     console.log(`Listening at http://localhost:${port}/`);
// });

