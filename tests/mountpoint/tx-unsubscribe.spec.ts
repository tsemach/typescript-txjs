
import createLogger from 'logging'; 
const logger = createLogger('UnSubscribe-Test');
const colors = require('colors');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';


import { TxCallback } from '../../src/tx-callback';
import { TxSubscribe, TxTask, TxUnSubscribe } from '../../src';

class C1Component {

}

describe('UnSubscribe Class Test', () => {

  it('tx-unsubscribe.spec.ts: test unsubscribe single subscribe', (done) => {
    logger.info('tx-unsubscribe.spec.ts: test unsubscribe single subscribe')

    let s = new TxSubscribe<C1Component>(null, 2);
    let enter = 0
    let total = 1;

    let unsubscribe = s.subscribe(
      (task) => {
        enter++
        logger.info("This is task callback: task = ", JSON.stringify(task.get()));
        assert.deepEqual({"head":{"head":"head"},"data": {"test":"unsubscribe"}}, task.get())
        
        if (enter >= total * 2) {
          unsubscribe.unsubscribe();                    
          assert.deepEqual(s.getSubscribesLength(), [0, 0, 0]);

          done()
        }
      },
      (error) => {
        enter++
        logger.info("This is error callback: error = ", JSON.stringify(error.get()));
        assert.deepEqual({"head":{"head":"ERROR"},"data":{"test":"error unsubscribe"}}, error.get())
        
        if (enter >= total * 2) {
          unsubscribe.unsubscribe();          
          assert.deepEqual(s.getSubscribesLength(), [0, 0, 0]);

          done();
        }
      }
    )
    
    s.next(new TxTask({head: 'head'}, {test: 'unsubscribe'}))
    s.error(new TxTask({head: 'ERROR'}, {test: 'error unsubscribe'}));
  });

  it('tx-unsubscribe.spec.ts: test unsubscribe second on two subscribes', (done) => {
    logger.info('tx-unsubscribe.spec.ts: test unsubscribe second on two subscribes')

    let s = new TxSubscribe<C1Component>(null, 2);
    let enter = 0    

    let unsubscribe_1 = s.subscribe(
      (task) => {
        enter++
        logger.info("This is task callback: task = ", JSON.stringify(task.get()));
        assert.deepEqual({"head":{"head":"head"},"data": {"test":"unsubscribe"}}, task.get())
        
        if (enter === 2) {                  
          done()
        }

      },
      (error) => {
        enter++
        logger.info("This is error callback: error = ", JSON.stringify(error.get()));
        assert.deepEqual({"head":{"head":"ERROR"},"data":{"test":"error unsubscribe"}}, error.get())
        
        if (enter === 2) {                  
          done()
        }

      }
    )

    let unsubscribe_2 = s.subscribe(
      (task) => {
        enter++
        logger.error("unsubscribe_2: This is task callback: task = ", JSON.stringify(task.get()));
        expect(1).to.equal(0);

        done()        
      },
      (error) => {
        enter++
        logger.error("unsubscribe_2: This is error callback: error = ", JSON.stringify(error.get()));
        expect(1).to.equal(0);

        done();      
      }
    )

    unsubscribe_2.unsubscribe();
    s.next(new TxTask({head: 'head'}, {test: 'unsubscribe'}))
    s.error(new TxTask({head: 'ERROR'}, {test: 'error unsubscribe'}));
  });

  it('tx-unsubscribe.spec.ts: test unsubscribe on two subscribes', (done) => {
    logger.info('tx-unsubscribe.spec.ts: test unsubscribe two subscribes')

    let s = new TxSubscribe<C1Component>(null, 2);
    let enter = 0    

    let unsubscribe_1 = s.subscribe(
      (task) => {
        enter++
        logger.info("This is task callback: task = ", JSON.stringify(task.get()));
        expect(1).to.equal(0);

        done()
      },
      (error) => {
        enter++
        logger.info("This is error callback: error = ", JSON.stringify(error.get()));
        expect(1).to.equal(0);

        done();
      }
    )

    let unsubscribe_2 = s.subscribe(
      (task) => {
        enter++
        logger.info("unsubscribe_2: This is task callback: task = ", JSON.stringify(task.get()));        
        assert.deepEqual({"head":{"head":"head"},"data": {"test":"unsubscribe"}}, task.get())
        
        if (enter === 2) {                  
          done()
        }

        
      },
      (error) => {
        enter++
        logger.info("unsubscribe_2: This is error callback: error = ", JSON.stringify(error.get()));
        assert.deepEqual({"head":{"head":"ERROR"},"data":{"test":"error unsubscribe"}}, error.get())

        if (enter === 2) {                  
          done()
        }

      }
    )

    unsubscribe_1.unsubscribe();
    s.next(new TxTask({head: 'head'}, {test: 'unsubscribe'}))
    s.error(new TxTask({head: 'ERROR'}, {test: 'error unsubscribe'}));
  });

});