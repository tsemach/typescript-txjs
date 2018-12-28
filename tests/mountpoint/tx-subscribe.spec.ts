
import createLogger from 'logging'; 
const logger = createLogger('Subscribe-Test');
const colors = require('colors');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';


import { TxCallback } from '../../src/tx-callback';
import { TxSubscribe, TxTask } from '../../src';

class C1Component {

}

describe('Subscribe Class Test', () => {

  it('tx-subscribe.spec.ts: test simple subscribe with limit = 0', (done) => {
    logger.info('tx-subscribe.spec.ts: test simple subscribe with limit = 0')

    let s = new TxSubscribe<C1Component>();
    let enter = 0

    s.subscribe(
      (task) => {
        enter++
        logger.info("This is task callback: task = ", JSON.stringify(task.get()));
        assert.deepEqual({"head":{"head":"head"},"data":{"data":"data"}}, task.get())
        if (enter >= 2) {
          done();
        }
      },
      (error) => {
        enter++
        logger.info("This is error callback: error = ", JSON.stringify(error.get()));
        assert.deepEqual({"head":{"head":"ERROR"},"data":{"data":"error data"}}, error.get())
        if (enter >= 2) {
          done();
        }
      }
    )

    s.next(new TxTask({head: 'head'}, {data: 'data'}))
    s.error(new TxTask({head: 'ERROR'}, {data: 'error data'}))
  });

  it('tx-subscribe.spec.ts: test several subscribes with limit = 0', (done) => {
    logger.info('tx-subscribe.spec.ts: test several subscribes with limit = 0')

    let s = new TxSubscribe<C1Component>();
    let enter = 0
    let total = 3;

    for (let i = 0; i < total; i++) {
      s.subscribe(
        (task) => {
          enter++
          logger.info("This is task callback: task = ", JSON.stringify(task.get()));
          assert.deepEqual({"head":{"head":"head"},"data":{"data":"data"}}, task.get())
          if (enter >= total * 2) {
            done();
          }
        },
        (error) => {
          enter++
          logger.info("This is error callback: error = ", JSON.stringify(error.get()));
          assert.deepEqual({"head":{"head":"ERROR"},"data":{"data":"error data"}}, error.get())
          if (enter >= total * 2) {
            done();
          }
        }
      )
    }

    s.next(new TxTask({head: 'head'}, {data: 'data'}))
    s.error(new TxTask({head: 'ERROR'}, {data: 'error data'}))
  });

  it('tx-subscribe.spec.ts: test several subscribes with limit', (done) => {
    logger.info('tx-subscribe.spec.ts: test several subscribes with limit')

    let s = new TxSubscribe<C1Component>(null, 3);
    let enter = 0
    let total = 3;

    for (let i = 0; i < total; i++) {
      s.subscribe(
        (task) => {
          enter++
          logger.info("This is task callback: task = ", JSON.stringify(task.get()));
          assert.deepEqual({"head":{"head":"head"},"data":{"data":"data"}}, task.get())
          if (enter >= total * 2) {
            done();
          }
        },
        (error) => {
          enter++
          logger.info("This is error callback: error = ", JSON.stringify(error.get()));
          assert.deepEqual({"head":{"head":"ERROR"},"data":{"data":"error data"}}, error.get())
          if (enter >= total * 2) {
            done();
          }
        }
      )
    }

    s.next(new TxTask({head: 'head'}, {data: 'data'}))
    s.error(new TxTask({head: 'ERROR'}, {data: 'error data'}))
  });

  it('tx-subscribe.spec.ts: test several subscribes with over the limit', (done) => {
    logger.info('tx-subscribe.spec.ts: test several subscribes with over the limit')

    let s = new TxSubscribe<C1Component>(null, 2);
    let enter = 0
    let total = 3;

    for (let i = 0; i < total; i++) {
      try {
        s.subscribe(
          (task) => {
            enter++
            logger.info("This is task callback: task = ", JSON.stringify(task.get()));
            assert.deepEqual({"head":{"head":"head"},"data":{"data":"data"}}, task.get())
            if (enter >= total * 2) {
              done();
            }
          },
          (error) => {
            enter++
            logger.info("This is error callback: error = ", JSON.stringify(error.get()));
            assert.deepEqual({"head":{"head":"ERROR"},"data":{"data":"error data"}}, error.get())
            if (enter >= total * 2) {
              done();
            }
          }
        )
      }
      catch (e) {
        logger.info(colors.yellow("got expection of '" + e.toString() + "' as should be"));
        done();
      }
    }
    
    s.next(new TxTask({head: 'head'}, {data: 'data'}))
    s.error(new TxTask({head: 'ERROR'}, {data: 'error data'}))        
  });

  it('tx-subscribe.spec.ts: test several subscribes with over the limit', (done) => {
    logger.info('tx-subscribe.spec.ts: test several subscribes with over the limit')

    let s = new TxSubscribe<C1Component>(null, 2);
    let enter = 0
    let total = 3;

    for (let i = 0; i < total; i++) {
      try {
        s.subscribe(
          (task) => {
            enter++
            logger.info("This is task callback: task = ", JSON.stringify(task.get()));
            assert.deepEqual({"head":{"head":"head"},"data":{"data":"data"}}, task.get())
            if (enter >= total * 2) {
              done();
            }
          },
          (error) => {
            enter++
            logger.info("This is error callback: error = ", JSON.stringify(error.get()));
            assert.deepEqual({"head":{"head":"ERROR"},"data":{"data":"error data"}}, error.get())
            if (enter >= total * 2) {
              done();
            }
          }
        )
      }
      catch (e) {
        logger.info(colors.yellow("got expection of '" + e.toString() + "' as should be"));
        done();
      }
    }
    
    s.next(new TxTask({head: 'head'}, {data: 'data'}))
    s.error(new TxTask({head: 'ERROR'}, {data: 'error data'}))        
  });
  
});