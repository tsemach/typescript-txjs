import createLogger from 'logging'; 
const logger = createLogger('TxConnectorExpress');

import { injectable, inject } from "inversify";
import "reflect-metadata";

import * as request from 'request-promise';

import * as uuid from 'uuid/v4';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import { TxCallback } from './tx-callback';
import { TxConnector } from "./tx-connector"
import { TxConnectorExpressService } from './tx-connector-express-service'
import { TxConnectorExpressConnection } from './tx-connector-express-connection';

/**
 * C2C - part of component-2-component communication.
 * use as default TxConnector implementation for express routes.
 */
@injectable()
export class TxConnectorExpress implements TxConnector {
  
  private connection = new TxConnectorExpressConnection();
  private service: TxConnectorExpressService;
  private express: express.Application;
  private server: any;

  id = uuid();

  constructor() {
    this.service = new TxConnectorExpressService(this);
    this.express = express();
    this.middleware();    
  }

    // configure express middleware.
  private middleware(): void {
    this.express.use(cors());
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({extended: false}));
  }
  
  /**
   * 
   * @param service host:port where the service is locate
   * @param path the path of the service
   */
  listen(service: string, path: string) {
    this.connection.parse(service, path);

    console.log('LISTEN: GOING TO ADD PATH: ' + path);
    this.express.use(path, this.service.add());

    if (this.service.isDefined() && this.connection.isDefined()) {
      console.log("IN LISTEN GOING TO CREATE SERTVICE")

      this.createServer();
    }
  }

  private createServer() {
    logger.info(`[TxConnectorExpress::createServer] going to listen on fule url: ${this.connection.getFullUrl()}`);

    this.server = this.express.listen(this.connection.port, () => {
      // success callback
      console.log(`Listening at ${this.connection.getUrl()}`);      
    });
  }

  subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: TxCallback<any>) {
    this.service.subscribe(dataCB, errorCB, completeCB);    

    if (this.service.isDefined() && this.connection.isDefined()) {      
      this.createServer();
    }
  };

  /**
   * send data through the express C2C to endpoint. 
   * @param service - host:port like 'localhost:3000'
   * @param route - method:path like 'POST:/somewhere', default is GET
   * @param data - data as TxTask<any>
   */
  async next(service: string, route: string, data: any) {
    let host = service.split(':')[0];
    let port = service.split(':')[1];
    
    let method = 'POST'
    let path = route;
    if (route.includes(':')) {
      method = route.split(':')[0];
      path = route.split(':')[1];
    }     

    let options = {
      method: method,
      uri: `http://${host}:${port}/${path}`,
      headers: {
        'Content-Type': 'application/json'        
      },
      body: data,
      json: true // automatically parses the JSON string in the response
    };
    console.log("NEXT: OPTION + " + JSON.stringify(options, undefined, 2));
    logger.info(`[TxConnectorExpress::next] going to send ${JSON.stringify(data, undefined, 2)} to: ${options.uri}`);

    await request(options);
  }

  error(service: string, route: string, data: any) {
    console.log("[TxConnectorExpress::error] TxConnectorExpress Method not implemented.");
  }

  close() {
    this.server.close();
  }

}
