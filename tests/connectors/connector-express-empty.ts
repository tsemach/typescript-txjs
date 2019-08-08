import createLogger from 'logging'; 
const logger = createLogger('TxConnectorExpress');

import { injectable, inject } from "inversify";
import "reflect-metadata";

import { TxCallback } from '../../src/tx-callback'
import { TxConnector } from "../../src/tx-connector"
import { TxConnectorConnection } from '../../src/tx-connector-connection';

/**
 * C2C - part of component-2-component communication.
 * use as default TxConnector implementation for express routes.
 */
@injectable()
export class TxConnectorExpress implements TxConnector {
  dataCB: (any: any) => void;
  errorCB: (any: any) => void

  constructor() {        
  }

  /* 
   * @param service host:port where the service is locate
   * @param path the path of the service
   */
  listen(service: string, path: string) {
    console.log("[TxConnectorExpress::listen] is called")
  }

  /**
   * @param service - port of where the service is located
   * @param path  - the path part of the request, http://<host>:<service>/path
   * @param dataCB 
   * @param errorCB 
   * @param completeCB 
   */
  subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: TxCallback<any>) {    
    this.dataCB = dataCB;
    this.errorCB = errorCB;
  };

  /**
   * send data through the express C2C to endpoint. 
   * @param service - host:port like 'localhost:3000'
   * @param route - method:path like 'POST:/somewhere', default is GET
   * @param data - data as TxTask<any>
   */
  async next(service: string, route: string, data: any) {
    this.dataCB(data);
  }

  error(service: string, route: string, data: any) {
    this.errorCB(data);
  }

  close(service: string, path: string) {
    console.log('[xConnectorExpress::clsoe] is called')
  }

}
