
// fork example taking from: https://medium.freecodecamp.org/node-js-child-processes-everything-you-need-to-know-e69498fe970a

const { fork } = require('child_process');

import { TxMountPointRxJSRegistry } from './../../../src/tx-mountpointrxjs-registry';

import createLogger from 'logging';
const logger = createLogger('service-a');

import { TxJobRegistry, TxTask, TxJob, TxJobExecutionOptions } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';
import { TxJobServicesHeadTask } from '../../../src/tx-job-services-task';

TxJobRegistry.instance.setServiceName('service-c');

const data = {
  "head": {
    "next": "service-a"
  },
  "data": {
    "job": {
      "name": "job-1",
      "uuid": "274X7SHNzu947toyfnqamY",
      "stack": "",
      "trace": "",
      "block": "",
      "error": false,
      "single": false,
      "revert": false,
      "current": "",
      "executeUuid": "",
      "sequence": 3,
      "services": {
        "stack": ["service-a", "service-b"], "trace": ["service-c"], 
        "block": ["service-c", "service-a", "service-b"],
        "current": "",
        "jobs": [
          {"service": "service-c", "components": ["GITHUB::GIST::C1", "GITHUB::GIST::C2", "GITHUB::GIST::C3"]},
          {"service": "service-a", "components": ["GITHUB::GIST::A1", "GITHUB::GIST::A2", "GITHUB::GIST::A3"]},
          {"service": "service-b", "components": ["GITHUB::GIST::B1", "GITHUB::GIST::B2", "GITHUB::GIST::B3"]}
        ]
      }
    },
    "options": {"execute": {"source": "service"}
    },
    "task": {
      "head": {
        "method": "from C3",
        "status": "ok"
      },
      "data": {
        "something": "more data here"
      }
    }
  }
}

async function run2() {
  await (new TxJobServicesComponent()).init();  
  let mp = TxMountPointRxJSRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');
  
  const forked = fork('./dist/tests/S2S/service-a/main.js');

  forked.on('message', (msg) => {
    logger.info('message from main', msg);
    if (msg === 'main:up') {
      logger.info('client: going to send task');
      mp.tasks().next(new TxTask<TxJobServicesHeadTask>({next: 'service-a'}, data));

      return;
    }
    if (msg === 'main:completed') {
      logger.info("client: main is completed");

      return;
    }    
  });
  
}

async function run() {
  logger.info('[service-a:run] declare the job and run it');

  TxJobRegistry.instance.setServiceName('service-c');
  await new TxJobServicesComponent().init();  

  let job = new TxJob('job-1'); 

  job.on('service-a').add('GITHUB::GIST::A1');
  job.on('service-a').add('GITHUB::GIST::A2');
  job.on('service-a').add('GITHUB::GIST::A3');

  job.on('service-b').add('GITHUB::GIST::B1');
  job.on('service-b').add('GITHUB::GIST::B2');
  job.on('service-b').add('GITHUB::GIST::B3');

  job.on('service-c').add('GITHUB::GIST::C1');
  job.on('service-c').add('GITHUB::GIST::C2');
  job.on('service-c').add('GITHUB::GIST::C3');

  const isCompletedTxJobervicesEndToEnd1 = job.getIsCompleted().subscribe(
    (task) => {
      console.log('[job-services-s2s-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(task, undefined, 2));
      process.send({name: 'service-a', statud: 'completed', task: task});
      isCompletedTxJobervicesEndToEnd1.unsubscribe();
    });                

  job.execute(new TxTask({
      method: 'create',
      status: 'start'
    },
    {something: 'more data here'}
    ),
    {
      execute: {source: 'service'}
    } as TxJobExecutionOptions
  );        
  
}  

run();


// const forked = fork('dist/tests/S2S/service-a/child.js');

// forked.on('message', (msg) => {
//   console.log('Message from child', msg);
// });

// forked.send({ hello: 'world' });
