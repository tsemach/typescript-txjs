
import { TxConnector } from './../../src/tx-connector';
import createLogger from 'logging'; 
const logger = createLogger('TxConnectorExpressService');

import * as express from 'express';
import * as request from 'request-promise';

import { TxCallback } from '../../src/tx-callback';
import { TxSubscribe } from '../../src/tx-subscribe';
import { TxTask } from '../../src/tx-task';
import { TxConnectorConnection } from '../../src/tx-connector-connection';
import { TxConnectorExpressListener } from './connector-express-full-listener';

export class TxConnectorExpressService implements TxConnector {

  private connection = new TxConnectorConnection();
  private callbacks = new TxSubscribe<this>();  
  private defined = false;
  private nexter: TxConnector = null;

  constructor(private listener: TxConnectorExpressListener, service: string, path: string) { 
    this.connection.parse(service, path);
  }

  public add(): express.Router {

    // route: /http --------------------------------------------------------------
    const router = express.Router();

    router.get('/', (req, res) => {      
      logger.info('[/TxConnectorExpressService:GET] data received was: ' + JSON.stringify(req.body));

      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');
      res.json({status: 'ok'});
    });
    
    router.post('/', (req, res) => {
      logger.info('[/TxConnectorExpressService:POST] data received was: ' + JSON.stringify(req.body));

      //this.callbacks.dataCB(new TxTask<any>(req.body.head, req.body.data));
      this.callbacks.next(new TxTask<any>(req.body.head, req.body.data));

      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');      
      res.json({status: '200'});
    });

    router.put('/:id', (req, res) => {
      console.log('angular: PUT id = ' + req.params.id);
      console.log('angular: PUT data received was: ' + JSON.stringify(req.body));

      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');

      res.json(req.body);
    });

    router.delete('/:id', (req, res) => {
      console.log('angular: DELETE id = ' + req.params.id);      
      console.log('angular: DELETE data received was: ' + JSON.stringify(req.body));
                    
      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');      
      res.json(req.body);
    });

    return router;
  // --------------------------------------------------------------------------
  }
    
  subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: TxCallback<any>) {
    this.callbacks.subscribe(dataCB, errorCB, completeCB);    
    this.defined = true;
  }

  error(service: string, route: string, data: any) {
    console.log("[TxConnectorExpress::error] TxConnectorExpress Method not implemented.");
  }

  close() {
    this.callbacks.unsubscribe(0);
  }

  getService() {
    return this.connection.getService();
  }

  getPath() {
    return this.connection.path;
  }

  isDefined() {
    return this.defined;
  }

  listen(service: string, route: string) {
    throw new Error("[TxConnectorExpressService::listen] Method not implemented.");
  }

  setNexter(nexter: TxConnector) {
    this.nexter = nexter;

    return this;
  }

  async next(service: string, route: string, data: any) {
    await this.nexter.next(service, route, data)
    // let host = service.split(':')[0];
    // let port = service.split(':')[1];
    
    // let method = 'POST'
    // let path = route;

    // if (route.includes(':')) {
    //   method = route.split(':')[0];
    //   path = route.split(':')[1];
    // }     

    // let options = {
    //   method: method,
    //   uri: `http://${host}:${port}/${path}`,
    //   headers: {
    //     'Content-Type': 'application/json'        
    //   },
    //   body: data,
    //   json: true // automatically parses the JSON string in the response
    // };
    // console.log("[TxConnectorExpress::next] NEXT: OPTION + " + JSON.stringify(options, undefined, 2));
    // logger.info(`[TxConnectorExpress::next] going to send ${JSON.stringify(data, undefined, 2)} to: ${options.uri}`);

    // await request(options);  
  }  

}

 
