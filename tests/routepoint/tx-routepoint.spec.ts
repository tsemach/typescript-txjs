
import createLogger from 'logging';
const logger = createLogger('RoutePoint-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import { S1Component } from './S1Component';
import { C1Component } from './C1Component';
import { C2Component } from './C2Component';

import { TxRoutePointRegistry } from './../../src/tx-routepoint-registry';
import { TxTask } from '../../src/tx-task';
import Application from './routepoint-application';
import { TxRouteServiceTask } from '../../src/tx-route-service-task';
import { isNullOrUndefined } from 'util';

TxRoutePointRegistry.instance.setApplication(Application.instance.app);

new S1Component();
new C1Component();
new C2Component();

describe('TxRoutePoint Testing', () => {
  before(() => {
    Application.instance.listen('localhost', 3001, () => {
      logger.info(`[tx-routepoint.spec.ts::listen] Listening at http://localhost:3001/`);
    });
  });

  after(() => {
    Application.instance.close();
  });
  
  it('tx-routepoint.spec.ts: round trip host -> R1 (remote) -> host test', async (done) => {
    logger.info('tx-routepoint.spec.ts: round trip host -> R1 (remote) -> host test');  
        
    const routepoint = await TxRoutePointRegistry.instance.get('GITHUB::C1');
    const reply = await routepoint.tasks().next(new TxRouteServiceTask<any>({source: 'tx-routepoint.spec.ts'}, {from: 'tester'}));    
    logger.info('[tx-routepoint.spec.ts::test-1] test-1 reply.data after next: ', JSON.stringify(reply.data, undefined, 2));

    const expected = {
      head: {
        headers: {
          source: "S1Component-server",
          token: "FEDCBA0987654321"
        },
        response: {
          status: 200,
          type: "json"
        }
      },
      data: {        
        source: "S1Component",
        status: "ok",
        originData: {
          head: {
            accept: "application/json, text/plain, */*",
            source: "tx-routepoint.spec.ts",
            "user-agent": "axios/0.19.0",
            host: "localhost:3001",
            connection: "close"
          },
          data: {
            from: "tester"
          }
        }
      }
    }
    assert.deepEqual(expected, reply.data);

    done();
  });  

  it('tx-routepoint.spec.ts: check that C1 is not getting C2 next', async (done) => {
    logger.info('tx-routepoint.spec.ts: check that C1 is not getting C2 next');  
         
    const C1 = await TxRoutePointRegistry.instance.get('GITHUB::C1');
    const C2 = await TxRoutePointRegistry.instance.get('GITHUB::C1');

    const expectedC2 = {
      head: {
        headers: {
          source: "S1Component-server",
          token: "FEDCBA0987654321"
        },
        response: {
          status: 200,
          type: "json"
        }
      },
      data: {
        source: "S1Component",
        status: "ok",
        originData: {
          head: {
            accept: "application/json, text/plain, */*",
            source: "tx-routepoint.spec.ts:C2",
            "user-agent": "axios/0.19.0",
            host: "localhost:3001",
            connection: "close"
          },
          data: {
            from: "C2"
          }
        }
      }
    };

    let gotC1Subscribe = false;
    let gotC1Next = false;
    let gotC2Subscribe = false;

    function isDone() {
      if ( gotC1Subscribe ) return;
      if ( ! gotC1Next ) return;
      if ( ! gotC2Subscribe ) return;

      done();
    }    

    C2.reply().subscribe(
      (task: TxRouteServiceTask<any>) => {    
        console.log('[x-routepoint.spec.ts::test-2::listen-C2] got reply from C2:', JSON.stringify(task.get(), undefined, 2));

        assert.deepEqual(expectedC2, task.getData());    
        gotC2Subscribe = true;

        isDone();
      }
    );

    C1.reply().subscribe(
      (task: TxRouteServiceTask<any>) => {    
        console.log('[x-routepoint.spec.ts::test-2::listen-C1] got reply from C1:', JSON.stringify(task.get(), undefined, 2));

        assert.fail('[x-routepoint.spec.ts::test-2::listen-C1] C1 should not be called on C2.next()')
        gotC1Subscribe = true;
        
        isDone();
      }
    );

    C2.tasks().next(new TxRouteServiceTask<any>({source: 'tx-routepoint.spec.ts:C2'}, {from: 'C2'}));
    gotC1Next = true;
  });

  it('tx-routepoint.spec.ts: check next / subscribe with two components', async (done) => {
    logger.info('tx-routepoint.spec.ts: check next / subscribe with two components');  
         
    const C1 = await TxRoutePointRegistry.instance.get('GITHUB::C1');
    const C2 = await TxRoutePointRegistry.instance.get('GITHUB::C2');

    const expectedC1 = {
      head: {
        headers: {
          source: "S1Component-server",
          token: "FEDCBA0987654321"
        },
        response: {
          status: 200,
          type: "json"
        }
      },
      data: {
        source: "S1Component",
        status: "ok",
        originData: {
          head: {
            accept: "application/json, text/plain, */*",
            source: "tx-routepoint.spec.ts:C1",
            "user-agent": "axios/0.19.0",
            host: "localhost:3001",
            connection: "close"
          },
          data: {
            "from": "C1"
          }
        }
      }
    };

    const expectedC2 = {
      head: {
        headers: {
          source: "S1Component-server",
          token: "FEDCBA0987654321"
        },
        response: {
          status: 200,
          type: "json"
        }
      },
      data: {
        source: "S1Component",
        status: "ok",
        originData: {
          head: {
            accept: "application/json, text/plain, */*",
            source: "tx-routepoint.spec.ts:C2",
            "user-agent": "axios/0.19.0",
            host: "localhost:3001",
            connection: "close"
          },
          data: {
            from: "C2"
          }
        }
      }
    };

    let gotC1Subscribe = false;
    let gotC1Next = false;
    let gotC2Subscribe = false;

    function isDone() {
      if ( ! gotC1Subscribe ) return;
      if ( ! gotC1Next ) return;
      if ( ! gotC2Subscribe ) return;

      done();
    }    

    C2.reply().subscribe(
      (task: TxRouteServiceTask<any>) => {    
        console.log('[x-routepoint.spec.ts::listen-C2] got reply from C2:', JSON.stringify(task.get(), undefined, 2));

        assert.deepEqual(expectedC2, task.getData());    
        gotC2Subscribe = true;

        isDone();
      }
    );

    C1.reply().subscribe(
      (task: TxRouteServiceTask<any>) => {    
        console.log('[x-routepoint.spec.ts::listen-C1] got reply from C1:', JSON.stringify(task.get(), undefined, 2));

        assert.deepEqual(expectedC1, task.getData());    
        gotC1Subscribe = true;
        
        isDone();
      }
    );

    C2.tasks().next(new TxRouteServiceTask<any>({source: 'tx-routepoint.spec.ts:C2'}, {from: 'C2'}));

    const reply = await C1.tasks().next(new TxRouteServiceTask<any>({source: 'tx-routepoint.spec.ts:C1'}, {from: 'C1'}));    
    logger.info('[tx-routepoint.spec.ts::test-3] test-3 reply.data after next: ', JSON.stringify(reply.data, undefined, 2));

    assert.deepEqual(expectedC1, reply.data);
    gotC1Next = true;

    isDone();
  });

});
