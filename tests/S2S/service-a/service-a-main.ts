import createLogger from 'logging';
const logger = createLogger('service-a:main');

import { TxJobRegistry, TxJob, TxTask, TxJobExecutionOptions } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';

import { A3Component } from '../components/A3.component';
import { A2Component } from '../components/A2.component';
import { A1Component } from '../components/A1.component';

// process.on('message', (msg) => {  
//   logger.info('[service-a: message from parent:', msg);

//   if (msg === 'service-a:exist') {
//     process.exit(0);
//   }
// });

TxJobRegistry.instance.setServiceName('service-a');

new A1Component();
new A2Component();
new A3Component();

async function init() {
  logger.info('[service-a:init] start service-a init');

  await new TxJobServicesComponent().init();  

  process.on('message', (msg) => {  
    logger.info('[service-a:init] message from parent:', msg);

    if (msg === 'service-a:run') {
      run();
    }
    if (msg === 'service-a:exit') {
      logger.info('[service-a:exit] service-a going to exist')

      process.exit(0);
    }
  });
  logger.info('[service-a:init] init completed');

  process.send('service-a:up');
}

async function run() {
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
      console.log('[service-a:run] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(task, undefined, 2));
      process.send({service: 'service-a', status: 'completed', task: task});

      isCompletedTxJobervicesEndToEnd1.unsubscribe();
    });                

  job.execute(new TxTask({
      method: 'create',
      status: 'start'
    },
    {something: 'more data here'}
    ),
    {
      execute: {
        source: 'service',
        notify: {
          name: 'SERVICE-C::JOB::COMPLETED',
          type: 'next',
          from: 'service-c'
        }
      }
    } as TxJobExecutionOptions
  );        
  
}  

init();


