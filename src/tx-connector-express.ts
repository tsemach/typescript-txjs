import createLogger from 'logging'; 
const logger = createLogger('TxConnectorExpress');

import { injectable, inject } from "inversify";
import "reflect-metadata";

import * as request from 'request-promise';

import { TxCallback } from './tx-callback';
import { TxConnector } from "./tx-connector"
import { TxConnectorExpressConnection } from './tx-connector-express-connection';
import { TxConnectorExpressListener } from './tx-connector-express-listener';

/**
 * C2C - part of component-2-component communication.
 * use as default TxConnector implementation for express routes.
 */
@injectable()
export class TxConnectorExpress implements TxConnector {
  
  private listners = new Map<string, TxConnectorExpressListener>()

  constructor() {        
  }

  private getListener(service: string) {  

    if (this.listners.has(service)) {
      return this.listners.get(service);
    }

    let listener = new TxConnectorExpressListener(this);    
    this.listners.set(service, listener);

    return listener;
  }

  /**
   * one listener is per port, on one port cloud be many paths.
   * each path is handle by TxConnectorExpressService
   * 
   * @param service host:port where the service is locate
   * @param path the path of the service
   */
  listen(service: string, path: string) {
    console.log('LISTEN: GOING TO ADD PATH: ' + path);
    let listener = this.getListener(service);

    return listener.listen(service, path);
  }

  /**
   * find the right listener 
   * 
   * @param service - port of where the service is located
   * @param path  - the path part of the request, http://<host>:<service>/path
   * @param dataCB 
   * @param errorCB 
   * @param completeCB 
   */
  subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: TxCallback<any>) {    
    throw Error('[TxConnectorExpress] calling subscribe on TxConnectorExpress is illegal, use the TxRoutePoint');
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
    console.log("[TxConnectorExpress::next] NEXT: OPTION + " + JSON.stringify(options, undefined, 2));
    logger.info(`[TxConnectorExpress::next] going to send ${JSON.stringify(data, undefined, 2)} to: ${options.uri}`);

    await request(options);
  }

  error(service: string, route: string, data: any) {
    throw Error('calling error on TxConnectorExpress is illegal, use the TxRoutePoint');
  }

  close(service: string, path: string) {
    let listener = this.getListener(service);
    listener.close(path);
  }

}
