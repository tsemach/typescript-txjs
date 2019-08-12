
import createLogger from 'logging';
const logger = createLogger('Connector-Express-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import { R1Component } from './R1Component';

import { TxRoutePointRegistry } from './../../src/tx-routepoint-registry';
import { TxTask } from '../../src/tx-task';
import Application from './route-application';

TxRoutePointRegistry.instance.setApplication(Application.instance.express);

new R1Component();

Application.instance.listen('localhost', 3001, () => {
  console.log(`[backend-server-main::listen] Listening at http://localhost:3001/`);
});

describe('TxRoutePoint Testing', () => {
  
  it('tx-routepoint.spec: round trip host -> R1 (remote) -> host test', async (done) => {
    logger.info('tx-routepoint.spec: round trip host -> R1 (remote) -> host test');  
    
    Application.instance.close();
  });

});
