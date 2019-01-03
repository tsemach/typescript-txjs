
import createLogger from 'logging'; 
const logger = createLogger('Subscribe-Test');
const colors = require('colors');

import { TxCallback } from 'rx-txjs';
import { TxSubscribe, TxTask } from 'rx-txjs';
import { runInContext } from 'vm';

class C1Component {
}

async function case_1() {  
  logger.info('tx-subscribe.spec.ts: test simple subscribe with limit = 0')

  let s = new TxSubscribe<C1Component>();
  let enter = 0

  s.subscribe(
    (task) => {
      enter++
      logger.info("This is task callback: task = ", JSON.stringify(task.get()));                
    },
    (error) => {
      enter++
      logger.info("This is error callback: error = ", JSON.stringify(error.get()));
    }
  )

  s.next(new TxTask({head: 'head'}, {data: 'data'}))
  s.error(new TxTask({head: 'ERROR'}, {data: 'error data'}))
}

async function run() {
  await case_1()
}

run()