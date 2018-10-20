
import createLogger from 'logging';
const logger = createLogger('monitor-main');

import 'mocha';
import chai = require('chai');
import {expect} from 'chai';
import {assert} from 'chai';

const request = require('request');
import waitOn = require('wait-on');

import { TxJob } from '../../src/tx-job';
import { TxTask } from '../../src/tx-task';
import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxMonitorServerTaskHeader } from './../../src/monitor/tx-monitor-server-task-header';
import '../../src/monitor/tx-monitor-server.component';

import './monitor-client.component';
import './C1.component';
import './C2.component';
import { SSL_OP_NETSCAPE_CA_DN_BUG } from 'constants';

describe('monitor-client.spec: Monitor Server - Start Server Test', () => {
  it('monitor-client.spec: Monitor Server - Start Server Test', async (done) => {
    logger.info('[run] example of using internal built in monitor server');
    logger.info('goint to monitor built in server on 3002 ..');
    logger.info('');

    // define the job
    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));

    let mp = TxMountPointRegistry.instance.get('RX-TXJS::MONITOR::SERVER');

    mp.reply().subscribe(async (task) => {
      logger.info('(subscribe) got status from monitor server: ', task);

      expect(task.head.method).to.equal('start');        
      expect(task.data.status).to.equal('ok');        

      await waitOn({
        resources: ['http://localhost:3002/monitor'],
        delay: 2000,
        timeout: 20000,
      });
      logger.info('(subscribe) monitor server is up on http://localhost:3002/monitor: ', task);      

      request('http://localhost:3002/monitor', { json: true }, (err, response, body) => {
          logger.info('(subscribe) monitor server response, statue = ', response.statusCode);
          logger.info('(subscribe) monitor server response = ', JSON.stringify(response));                
          logger.info('(subscribe) monitor listen on port = ', response.request.port);                
          logger.info('(subscribe) monitor server is ready on http://localhost:3002/monitor: body = ', body);

          expect(response.request.port).to.equal('3002');
          expect(response.statusCode).to.equal(200);        
          expect(body.monitor).to.equal('on');
          done();
        })      
      });

    mp.tasks().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, {host: 'localhost', port: 3002}));    
  }).timeout(20000);  
});


// async function run() {
//   logger.info('[run] example of using internal built in monitor server');

//   // define the job
//   let job = new TxJob('job-1'); // or create through the TxJobRegistry

//   job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
//   job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));

//   let mp = TxMountPointRegistry.instance.get('RX-TXJS::MONITOR::SERVER');

//   mp.reply().subscribe(async (task) => {
//     logger.info('got status from monitor: ', task);
//     await waitOn({
//       resources: ['http://localhost:3002/monitor'],
//       timeout: 10000,
//     });

//     superagent
//       .open()
//       .get('/monitor')
//       .then(res => {
//         console.log("SUPERAGENT res  = ", res);      
//       })
//       .catch(err => {      
//         console.log("SUPERAGENT ERROR  = ", err);      
//       });
//   });
//   mp.tasks().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, {host: 'localhost', port: 3002}));
// }

// logger.info('goint to monitor built in server on 3001 ..');
// logger.info('');

// run();
