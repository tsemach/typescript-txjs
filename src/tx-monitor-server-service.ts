import createLogger from 'logging'; 
const logger = createLogger('TxMonitorServerService');

import * as express from 'express';

class TxMonitorServerService {

  constructor() {
  }

  public add(): express.Router {
    // route: /http --------------------------------------------------------------
    const router = express.Router();

    router.get('/', (req, res) => {
      // route: /service/get ...      
      logger.info('[/monitor:GET] data received was: ' + JSON.stringify(req.body));

      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');
      res.json({monitor: 'on'});
    });
    
    router.post('/', (req, res) => {
      // route: /http/post ...
      logger.info('angular: POST data received was: ' + JSON.stringify(req.body));

      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');

      if (0) {
        res.status(400);

        res.json({
          id: 'abcd'
        });

        return;
      }

      res.json({
        id: '1111'
      });
    });

    router.put('/put/:id', (req, res) => {
      // route: /http/post ...
      //console.log('angular: PUT got call from client put ' + req);
      console.log('angular: PUT id = ' + req.params.id);
      console.log('angular: PUT data received was: ' + JSON.stringify(req.body));

      // set the appropriate HTTP header
      res.setHeader('Content-Type', 'application/json');

      res.json(req.body);
    });

    router.delete('/delete/:id', (req, res) => {
      // route: /http/delete ...
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

 export default new TxMonitorServerService();
