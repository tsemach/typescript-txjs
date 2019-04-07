
import createLogger from 'logging';
const logger = createLogger('Connector-Express-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import { R1Component } from './R1Component';

import { TxRoutePointRegistry } from './../../src/tx-routepoint-registry';
import { TxConnectorExpress } from '../connectors/connector-express-full';
import { TxTask } from '../../src';

TxRoutePointRegistry.instance.setDriver(TxConnectorExpress);
new R1Component();

describe('TxRoutePoint Testing', () => {
  
  it('tx-routepoint.spec: round trip host -> R1 (remote) -> host test', async (done) => {
    logger.info('tx-routepoint.spec: round trip host -> R1 (remote) -> host test');  

    // R1 is the remote component that receivce the data
    let R1 = TxRoutePointRegistry.instance.get('GITHUB::R1')

    // R2 is local routepoint that receive response from R1
    let R2 = TxRoutePointRegistry.instance.create('GITHUB::R2')
  
    let expected = {
      "head": {
        "from": "localhost:3001:/test2"
      },
      "data": "this is the data send from remote server R1 to localhost"
    }
    
    R2.listen('localhost:3002', '/test2');  // R2 is my host

    // subscribe to calleback from R1 (remote -> localhost)
    R2.subscribe(
      (task) => {
        logger.info('[R2:subscribe] got data from R1 (remote): task = ' + JSON.stringify(task.get(), undefined, 2))
        assert.deepEqual(expected, task.get());

        R2.close();
        done();
      });    
                
    R1.next('localhost:3001', 'test1', new TxTask<any>({port: '3002', path: 'test2'}, 'this is the data send to remote server R1'))
  });

});
