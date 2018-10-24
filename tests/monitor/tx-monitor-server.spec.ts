
import createLogger from 'logging';
const logger = createLogger('tx-monitor-server.spec');

import 'mocha';
import {expect} from 'chai';
import {assert} from 'chai';

const request = require('request');
import waitOn = require('wait-on');

import { TxTask } from '../../src';
import { TxMountPointRegistry } from '../../src';
import { TxMonitorServerTaskHeader } from '../../src/tx-monitor-server-task-header';
import '../../src/tx-monitor-server.component';

import './monitor-client.component';
import './C1.component';
import './C2.component';

let url = 'http://localhost:3002/rx-txjs/monitor'
async function checkMonitorServerUp(task, done) {
  if (task.head.method !== 'start') {        
    return; 
  }

  logger.info('(subscribe) got status from monitor server: ', task);

  expect(task.head.method).to.equal('start');        
  expect(task.data.status).to.equal('ok');          

  await waitOn({
    resources: ['http://localhost:3002/rx-txjs/monitor'],
    delay: 2000,
    timeout: 10000,
  });
  logger.info(`(subscribe) monitor server is up on ${url}: ${task}`);      

  request(url, { json: true }, (err, response, body) => {
      logger.info('(subscribe) monitor server response, statue = ', response.statusCode);
      logger.info('(subscribe) monitor server response = ', JSON.stringify(response));                
      logger.info('(subscribe) monitor listen on port = ', response.request.port);                
      logger.info(`(subscribe) monitor server is ready on ${url}: body = ${body}`);

      expect(response.request.port).to.equal('3002');
      expect(response.statusCode).to.equal(200);        
      expect(body.monitor).to.equal('on');
      done();
    })
}

describe('monitor.spec: Monitor Server Tests', () => {
  it('monitor.spec: Monitor Server - Server Up Test', async (done) => {
    logger.info('[monitor.spec] Monitor Server - Server Up Test');
    logger.info('[monitor.spec] example of using internal built in monitor server');
    logger.info('[monitor.spec] going to test monitor built in server on localhost:3002 ..');
    logger.info('');

    let mp = TxMountPointRegistry.instance.get('RX-TXJS::MONITOR::SERVER');

    mp.reply().subscribe(async (task) => {
      checkMonitorServerUp(task, done);      
    });
    
    mp.tasks().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, {host: 'localhost', port: 3002}));    
  }).timeout(10000);

  it('monitor.spec: Monitor Server - Server Close Test', async (done) => {
    logger.info('[monitor.spec] Monitor Server - Server Close Test');    
    logger.info('[monitor.spec] going to test closing monitor built in server on localhost:3002 ..');
    logger.info('');

    let mp = TxMountPointRegistry.instance.get('RX-TXJS::MONITOR::SERVER');

    mp.reply().subscribe(async (task) => {
      if (task.head.method !== 'close') {      
        return;        
      }

      logger.info('(subscribe) got status from closing monitor server component: ', task);

      expect(task.head.method).to.equal('close');
      expect(task.data.status).to.equal('ok');        
      
      request(url, { json: true }, (err, response, body) => {
        logger.info('got error', err, ' as expected');

        expect(err).to.not.equal(null);        
        expect(body).to.equal(undefined);        

        done();
      })
      
    });    
    mp.tasks().next(new TxTask<TxMonitorServerTaskHeader>({method: 'close'}));        
  }).timeout(5000);

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
//       resources: ['http://localhost:3002/rx-txjs/monitor'],
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

