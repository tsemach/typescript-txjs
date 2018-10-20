import createLogger from 'logging'; 
const logger = createLogger('TxMonitorServerApplication');

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

export class TxMonitorServerApplication {
  private static _instance: TxMonitorServerApplication = null;

  public express: express.Application;
  
  private constructor() {    
    this.express = express();
    this.middleware();
  }

  public static get instance(): TxMonitorServerApplication {
    if (this._instance) { 
      return this._instance;
    }
    this._instance = new this();

    return this._instance;
  }

  // configure express middleware.
  private middleware(): void {
    //this.express.use(logger('dev'));
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: false}));
  }

  /**
   *
   * @param where - thed of which the service is route (regular express path)
   * @param service - a class which implement this route
   */
  register(where, service) {    
    this.express.use(where, service.add());
  }

  listen(host: string, port: number) {
    this.express.listen(port, () => {
      // success callback
      console.log(`Listening at http://${host}:${port}/`);
    });
  }
}

// make sure instance is ready 
TxMonitorServerApplication.instance;

require('./tx-monitor-server-service');

// export default // let application = new Application();

// const port: number = 3000;

// application.express.listen(port, () => {
//     // success callback;
//     console.log(`Listening at http://localhost:${port}/`);
// });

