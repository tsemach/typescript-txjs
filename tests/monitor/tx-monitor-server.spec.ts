
import createLogger from 'logging';
const logger = createLogger('Monitor-Server');

import 'mocha';
import {expect} from 'chai';
import {assert} from 'chai';

const request = require('request');
import waitOn = require('wait-on');

import { TxTask } from '../../src';
import TxMonitor from '../../src/tx-monitor';
import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxMonitorServerTaskHeader } from '../../src/tx-monitor-server-task-header';

import './monitor-client.component';
import './C1.component';
import './C2.component';

let port = 3002
let url = 'http://localhost:' + port + '/rx-txjs/monitor'

describe('tx-monitor-server.spec.ts: Monitor Server Tests', () => {
  it('tx-monitor-server.spec.ts: Monitor Server - Server Up Test', async (done) => {
    logger.info('[monitor.spec] Monitor Server - Server Up Test');
    logger.info('[monitor.spec] example of using internal built in monitor server');
    logger.info('[monitor.spec] going to test monitor built in server on localhost:' + port + ' ...');
    logger.info('');

    let mp = TxMountPointRegistry.instance.use('RX-TXJS::MONITOR::SERVER');

    const mpReplySubscribe = mp.reply().subscribe(async (task) => {
      if (task.head.method !== 'start') {
        return;
      }

      logger.info('(subscribe) got status from monitor server: ', task);

      expect(task.head.method).to.equal('start');
      expect(task.data.status).to.equal('ok');          

      await waitOn({
        resources: [url],
        delay: 2000,
        timeout: 10000,
      });
      logger.info(`(subscribe) monitor server is up on ${url}: ${task}`);      

      request(url, { json: true }, (err, response, body) => {
          logger.info('(subscribe) monitor server response, statue = ', response.statusCode);
          logger.info('(subscribe) monitor server response = ', JSON.stringify(response));                
          logger.info('(subscribe) monitor listen on port = ', response.request.port);                
          logger.info(`(subscribe) monitor server is ready on ${url}: body = ${body}`);

          expect(response.request.port).to.equal(port.toString());
          expect(response.statusCode).to.equal(200);        
          expect(body.monitor).to.equal('on');
          mpReplySubscribe.unsubscribe();

          done();
        })
    });
    
    console.log("IN  MONITOR SPEC BEFOIRE CALL TO mp.tasks()")
    mp.tasks().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, {host: 'localhost', port: port}));
  }).timeout(10000);

  it('tx-monitor-server.spec.ts: Monitor Server - Server Close Test', async (done) => {
    logger.info('[tx-monitor-server.spec.ts] Monitor Server - Server Close Test');    
    logger.info('[tx-monitor-server.spec.ts] going to test closing monitor built in server on localhost:3002 ..');
    logger.info('');

    let mp = TxMountPointRegistry.instance.use('RX-TXJS::MONITOR::SERVER');

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
