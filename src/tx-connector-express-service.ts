import createLogger from 'logging'; 
const logger = createLogger('TxMonitorServerService');

import * as express from 'express';

import { TxConnectorExpress } from './tx-connector-express';
import { TxCallback } from './tx-callback';
import { TxSubscribe } from './tx-subscribe';
import { TxTask } from './tx-task';

export class TxConnectorExpressService {
  private callbacks = new TxSubscribe<TxConnectorExpress>();
  private connector: TxConnectorExpress;
  private defined = false;

  constructor(connector: TxConnectorExpress) { 
    this.connector = connector
  }

  subscribe(dataCB: TxCallback<any>, errorCB?: TxCallback<any>, completeCB?: TxCallback<any>) {
    this.callbacks.subscribe(dataCB, errorCB, completeCB);    
    this.defined = true;
  }

  isDefined() {
    return this.defined;
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
      console.log("TTTTTTTTTT ADDING POST")
      logger.info('[/TxConnectorExpressService:POST] data received was: ' + JSON.stringify(req.body));

      //this.callbacks.dataCB(new TxTask<any>(req.body.head, req.body.data));
      this.callbacks.next(new TxTask<any>(req.body.head, req.body.data), this.connector);

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
    
}

 
