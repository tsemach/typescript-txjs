
import createLogger from 'logging';
const logger = createLogger('Job-Services-End-To-End-Error-Test');
const { fork } = require('child_process');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

describe('Job Service Class - End-To-End', () => {

  /**
   */
  // it('tx-job-services-end-2-end.spec.ts: test job services end to end', async (done) => {
  //   logger.info('tx-job-services-end-2-end.spec.ts: test job services end to end');        

  //   let services = {a: {fork, ready: false}, b: {fork, ready: false}, c: {fork, ready: false}};
    
  //   services.a.fork = fork('./dist/tests/S2S/service-a/service-a-main.js');
  //   services.b.fork = fork('./dist/tests/S2S/service-b/service-b-main.js');
  //   services.c.fork = fork('./dist/tests/S2S/service-c/service-c-main.js');

  //   function run() {
  //     if (services.a.ready && services.b.ready && services.c.ready) {
  //       services.a.fork.send('service-a:run');      
  //     }
  //   }

  //   services.a.fork.on('message', (msg) => {
  //     logger.info('message from service-a', msg);

  //     if (msg === 'service-a:up') {
  //       logger.info('tx-job-services-end-2-end.spec.ts: service-a is up');      

  //       services.a.ready = true;
  //       run();
  //     }      
  //   });

  //   services.b.fork.on('message', (msg) => {
  //     logger.info('message from service-b', msg);

  //     if (msg === 'service-b:up') {
  //       logger.info('tx-job-services-end-2-end.spec.ts: service-b is up');      

  //       services.b.ready = true;
  //       run();
  //     }      
  //   });

  //   services.c.fork.on('message', (msg) => {
  //     logger.info('message from service-c', msg);

  //     if (msg === 'service-c:up') {
  //       logger.info('tx-job-services-end-2-end.spec.ts: service-c is up');

  //       services.c.ready = true;
  //       run();
  //     }    

  //     if (msg.status === 'completed') {
  //       logger.info('tx-job-services-end-2-end.spec.ts: service-c completed, looks good :)');

  //       services.a.fork.send('service-a:exit');      
  //       services.b.fork.send('service-b:exit');      
  //       services.c.fork.send('service-c:exit');      
        
  //       expect(msg.status).to.equal('completed');
  //       expect(msg.task.data.head.status).to.equal('ok');
  //       expect(msg.task.data.head.method).to.equal('from C3');

  //       done();
  //     }
  //   });
    
  // }).timeout(2000);

  it('tx-job-services-end-2-end-error.spec.ts: test job services end to end with error', async (done) => {
    logger.info('tx-job-services-end-2-end-error.spec.ts: test job services end to end with error');

    let services = {a: {fork, ready: false}, b: {fork, ready: false}, c: {fork, ready: false}};
    
    services.a.fork = fork('./dist/tests/S2S/service-error-a/service-a-main.js');
    services.b.fork = fork('./dist/tests/S2S/service-error-b/service-b-main.js');
    services.c.fork = fork('./dist/tests/S2S/service-error-c/service-c-main.js');

    function run() {
      if (services.a.ready && services.b.ready && services.c.ready) {
        services.a.fork.send('service-error-a:run');
      }
    }

    services.a.fork.on('message', (msg) => {
      logger.info('message from service-error-a', msg);

      if (msg === 'service-error-a:up') {
        logger.info('tx-job-services-end-2-end-error.spec.ts: (error) service-error-a is up');      

        services.a.ready = true;
        run();
      }      
    });

    services.b.fork.on('message', (msg) => {
      logger.info('message from service-error-b', msg);

      if (msg === 'service-error-b:up') {
        logger.info('tx-job-services-end-2-end-error.spec.ts: (error) service-error-b is up');

        services.b.ready = true;
        run();
      }      
    });

    services.c.fork.on('message', (msg) => {
      logger.info('message from service-error-c', msg);

      if (msg === 'service-error-c:up') {
        logger.info('tx-job-services-end-2-end-error.spec.ts: (error) service-error-c is up');

        services.c.ready = true;
        run();
      }    

      if (msg.status === 'completed') {
        logger.info('tx-job-services-end-2-end-error.spec.ts: (error) service-error-c completed, looks good :)');

        services.a.fork.send('service-error-a:exit');      
        services.b.fork.send('service-error-b:exit');      
        services.c.fork.send('service-error-c:exit');      
        
        // expect(msg.status).to.equal('completed');
        // expect(msg.task.data.head.status).to.equal('ok');
        // expect(msg.task.data.head.method).to.equal('from C3');

        done();
      }
    });
    
  }).timeout(2000);

});
  