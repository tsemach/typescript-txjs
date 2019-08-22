
import createLogger from 'logging';
const logger = createLogger('RoutePoint-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import { R1Component } from './R1Component';
import { R2Component } from './R2Component';

import { TxRoutePointRegistry } from './../../src/tx-routepoint-registry';
import { TxTask } from '../../src/tx-task';
import Application from './routepoint-application';
import { TxRouteServiceTask } from '../../src/tx-route-service-task';

TxRoutePointRegistry.instance.setApplication(Application.instance.app);

new R1Component();
new R2Component();

Application.instance.listen('localhost', 3001, () => {
  logger.info(`[tx-routepoint.spec::listen] Listening at http://localhost:3001/`);
});

describe('TxRoutePoint Testing', () => {
  
  it('tx-routepoint.spec: round trip host -> R1 (remote) -> host test', async (done) => {
    logger.info('tx-routepoint.spec: round trip host -> R1 (remote) -> host test');  
        
    const routepoint = await TxRoutePointRegistry.instance.get('GITHUB::R2');
    const reply = await routepoint.tasks().next(new TxRouteServiceTask<any>({source: 'tx-routepoint.spec.ts'}, {from: 'tester'}));    
    logger.info('[tx-routepoint.spec] reply.data after next: ', JSON.stringify(reply.data, undefined, 2));

    Application.instance.close();

    const expected = {
      head: {
        headers: {
          source: "R1Component-server",
          token: "FEDCBA0987654321"
        },
        response: {
          status: 200,
          type: "json"
        }
      },
      data: {
        source: "R1Component",
        status: "ok"
      }
    }
    assert.deepEqual(expected, reply.data);

    done();
  });

});
