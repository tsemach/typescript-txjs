
import { TxMountPoint } from './tx-mountpoint';
import { TxRouteServiceExpress } from './tx-route-service-express';
import { TxRouteServiceConfig } from "./tx-route-service-config";
import { TxRoutePointRegistry } from './tx-routepoint-registry';
import TxRouteServiceExpressGet from './tx-route-service-express-get';
import { TxSubject } from './tx-subject';
import { TxTask } from './tx-task';

export class TxRoutePoint implements TxMountPoint {
  protected config: TxRouteServiceConfig;

  private _tasks: TxRouteServiceExpress<any, any>;
  private _undos: TxRouteServiceExpress<any, any>;
  private _reply = new TxSubject<TxRoutePoint>();  
    
  constructor(private _name: string | Symbol, config: TxRouteServiceConfig) {    
    this.init(config);
  }

  init(config: TxRouteServiceConfig) {
    this.config = config;

    const application = TxRoutePointRegistry.instance.getApplication();

    if (config && config.method.toLowerCase() === 'get') {
      this._tasks = new TxRouteServiceExpressGet<any, any>(application, config);
      this._undos = new TxRouteServiceExpressGet<any, any>(application, config);
    }
  }

  adjust(from: TxRoutePoint) {
    this._name = from._name;
    this.init(from.config);

    return this;
  }

  get name() {
    if (typeof this._name === 'string') {
      return this._name;
    }
    return this._name.toString();
  }

  tasks() {
    return this._tasks;
  }

  reply() {
    return this._tasks;
  }
  
  undos() {
    return this._undos;
  }

  getConfig() {
    return this.config;
  }
}

// import { injectable, inject } from "inversify";
// import "reflect-metadata";

// import * as uuid from 'uuid/v4';

// import { TxConnector } from "./tx-connector"

// import { TxTYPES } from "./tx-injection-types";
// import { TxCallback } from "./tx-callback";
// import { TxConnectorConnection } from "./tx-connector-connection";

// @injectable()
// export class TxRoutePoint {
//   @inject(TxTYPES.TxConnector) private _route: TxConnector;
//   @inject(TxTYPES.TxPointName) private _name: string | Symbol = '';
//   private _service: TxConnector = null;
//   private _connection = new TxConnectorConnection();
  
//   id = uuid();

//   constructor() {
//   }

//   get name() {
//     return this._name;
//   }

//   listen(service: string, path: string) {
//     this._service = this._route.listen(service, path);
//     this._connection.parse(service, path);

//     return this._service;
//   }

//   subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: (any?: any) => void) {  
//     this._service.subscribe(dataCB, errorCB, completeCB);

//     return this;
//   }

//   async next(service: string, route: string, data: any) {
//     await this._service.next(service, route, data);
//   }

//   close() {
//     this._route.close(this._connection.service, this._connection.path);
//   }

// }
