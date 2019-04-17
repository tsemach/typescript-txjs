
// import createLogger from 'logging'; 
// const logger = createLogger('TxConnectorExpressListener');

// import { injectable, inject } from "inversify";
// import "reflect-metadata";

// import * as request from 'request-promise';

// import * as uuid from 'uuid/v4';
// import * as express from 'express';
// import * as bodyParser from 'body-parser';
// import * as cors from 'cors';

// import { TxCallback } from './tx-callback';
// import { TxConnector } from "./tx-connector"
// import { TxConnectorExpressService } from './tx-connector-express-service'
// import { TxConnectorConnection } from './tx-connector-connection';
// import { TxConnectorExpress } from './tx-connector-express';

// /**
//  * C2C - part of component-2-component communication.
//  * use as default TxConnector implementation for express routes.
//  */
// @injectable()
// export class TxConnectorExpressListener {
  
//   private port = 0;
//   private services = new Map<string, TxConnectorExpressService>();
//   private express: express.Application;
//   private server: any;
  
//   /**
//    * 
//    * @param connector listener has knowladge about in which connector it belong
//    */
//   constructor(private connector: TxConnectorExpress) {    
//     this.express = express();
//     this.middleware();
//   }

//     // configure express middleware.
//   private middleware(): void {
//     this.express.use(cors());
//     this.express.use(bodyParser.json());
//     this.express.use(bodyParser.urlencoded({extended: false}));
//   }

//   /**
//    * listen can be called many time on different path but on the same port
//    * 
//    * @param conn host:port where the service is locate
//    * @param path the path of the service
//    */
//   listen(conn: string, path: string) {        
//     let port = conn.split(':')[1];

//     if (this.port !== 0 && this.port !== +port) {
//       throw Error('listen is already listen on port ' + this.port + ' but got different port ' + port);
//     }
    
//     if (this.services.has(path)) {
//       return this.services.get(path);
//     }

//     let service = new TxConnectorExpressService(this, conn, path);
//     this.services.set(path, service);
//     this.express.use(path, service.add());

//     if (this.port === 0) {
//       this.port = +port;
//       this.createServer();
//     }    

//     return service;
//   }

//   private createServer() {
//     logger.info(`[TxConnectorExpressListener::createServer] going to listen on port: ${this.port}`);

//     this.server = this.express.listen(this.port, () => {
//       // success callback
//       console.log(`Listening at port ${this.port}`);      
//     });
//   }

//   close(path: string) {
//     if (path && this.services.has(path)) {        
//       let service = this.services.get(path);

//       service.close()
//       this.services.delete(path);
//     }

//     if (this.services.size === 0) {
//       this.server.close();
//     }
//   }

// }
