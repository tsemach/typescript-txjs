
import createLogger from 'logging';
const logger = createLogger('Connector-Express-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import { TxConnectorExpress } from '../connectors/connector-express-full';
import { TxTask } from '../../src';

describe('Check TxConnectorExpress Testing', () => {

  it('tx-connector-express.spec: simple tx-connector-express test', async (done) => {
    logger.info('tx-connector-express.spec: simple tx-connector-express test');
    
    let express = new TxConnectorExpress();
  
    let expected = {
      head: {
        from: "test"
      },
      data: "this is the data"
    }

    let service = await express.listen('localhost:3000', '/test');

    service.subscribe(
      (task) => {
        logger.info('[subscribe] got data from express connector: task = ' + JSON.stringify(task.get(), undefined, 2))
        assert.deepEqual(expected, task.get());

        express.close('localhost:3000', '/test');
        done();
      });    
                
    express.next('localhost:3000', 'test', new TxTask<any>({from: 'test'}, 'this is the data'))
  });  

  it('tx-connector-express.spec: create several listerners on the same port test', async (done) => {
    logger.info('tx-connector-express.spec: create several listerners on the same port test');
    
    let express = new TxConnectorExpress();
    let received = 0;
  
    // create first service --------------------------------------------------------------------------------------------
    let expected_1 = {
      head: {
        from: "test-1"
      },
      data: "this is the data-1"
    }

    let service_1 = await express.listen('localhost:3000', '/test1');

    service_1.subscribe(
      (task) => {
        logger.info('[subscribe-1] got data from express connector: task = ' + JSON.stringify(task.get(), undefined, 2))
        assert.deepEqual(expected_1, task.get());

        express.close('localhost:3000', '/test1');
        received++
        if (received >= 2) {
          done();
        }
      });    
                
    express.next('localhost:3000', 'test1', new TxTask<any>({from: 'test-1'}, 'this is the data-1'))
    //------------------------------------------------------------------------------------------------------------------

    // create second service -------------------------------------------------------------------------------------------
    let expected_2 = {
      head: {
        from: "test-2"
      },
      data: "this is the data-2"
    }

    let service_2 = await express.listen('localhost:3000', '/test2');

    service_2.subscribe(
      (task) => {
        logger.info('[subscribe-2] got data from express connector: task = ' + JSON.stringify(task.get(), undefined, 2))
        assert.deepEqual(expected_2, task.get());

        express.close('localhost:3000', '/test2');
        received++;
        if (received >= 2) {
          done();
        }
      });    
                
    express.next('localhost:3000', 'test2', new TxTask<any>({from: 'test-2'}, 'this is the data-2'))
    //------------------------------------------------------------------------------------------------------------------
  });  

});
