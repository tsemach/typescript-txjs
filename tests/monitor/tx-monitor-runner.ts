
import createLogger from 'logging';
const logger = createLogger('monitor-runner');

import request = require('request');
import waitOn = require('wait-on');

import { TxTask } from '../../src';
import { TxMountPointRegistry } from '../../src';
import '../../src/tx-monitor-server.component';

async function run() {  
  logger.info('[run] example of using internal built in monitor server');

  let mp = TxMountPointRegistry.instance.get('RX-TXJS::MONITOR::SERVER');

  mp.reply().subscribe(async (task) => {
    logger.info('got status from monitor: ', task);

    await waitOn({
      resources: ['http://localhost:3002/monitor'],
      delay: 1000,
      timeout: 20000,
    });
    logger.info('(subscribe) waitOn is completed, going to request monitor');

    await request('http://localhost:3002/monitor', { json: true }, (err, response, body) => {
        logger.info('(subscribe) monitor server response, statue = ', response.statusCode);
        logger.info('(subscribe) monitor server response, body = ', response);        
        logger.info('(subscribe) monitor server response, body = ', body);
        logger.info('(subscribe)');
        logger.info('(subscribe) monitor server is ready on http://localhost:3002/monitor: ', task);
      })      
  });  
  mp.tasks().next(new TxTask({method: 'start'}, {host: 'localhost', port: 3002}));
}

logger.info('goint to monitor built in server on 3001 ..');
logger.info('');

run();
