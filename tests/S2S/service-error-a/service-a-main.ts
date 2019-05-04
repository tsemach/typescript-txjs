import createLogger from 'logging';
const logger = createLogger('service-error-a:main');

import { TxJobRegistry, TxJob, TxTask, TxJobExecutionOptions, TxMountPointRxJSRegistry } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';

import { A3Component } from '../components/A3.component';
import { A2Component } from '../components/A2.component';
import { A1Component } from '../components/A1.component';

TxJobRegistry.instance.setServiceName('service-error-a');

new A1Component();
new A2Component();
new A3Component();

async function init() {
  logger.info('[service-error-a:init] start service-error-a init');

  await new TxJobServicesComponent().init();  

  let mp = TxMountPointRxJSRegistry.instance.create('SERVICE-A::S2S::COMPLETED');  
  mp.reply().subscribe(
    (task) => {
      logger.error("service-error-a: ERROR (task) got data from TxJobServicesComponent: " + JSON.stringify(task.get(), undefined, 2));
      
      // notify the caller (the tester) that job is completed
      process.send({service: 'service-error-a', status: 'completed', task: task});
    },
    (error) => {
      logger.info("service-error-a: (error) got error from TxJobServicesComponent: " + JSON.stringify(error.get(), undefined, 2));
      
      // notify the caller (the tester) that job is completed
      process.send({service: 'service-error-a', status: 'completed', task: error});
    }
  )

  process.on('message', (msg) => {  
    logger.info('[service-error-a:init] message from parent:', msg);

    if (msg === 'service-error-a:run') {
      logger.info('[service-error-a:init] service-error-a got run request:', msg);

      run();
    }
    if (msg === 'service-error-a:exit') {
      logger.info('[service-error-a:exit] service-error-a going to exist')

      process.exit(0);
    }
  });
  logger.info('[service-error-a:init] init completed');

  process.send('service-error-a:up');
}

async function run() {
  let job = new TxJob('job-1'); 

  job.on('service-error-a').add('GITHUB::GIST::A1');
  job.on('service-error-a').add('GITHUB::GIST::A2');
  job.on('service-error-a').add('GITHUB::GIST::A3');

  job.on('service-error-b').add('GITHUB::GIST::E1');
  job.on('service-error-b').add('GITHUB::GIST::E2');
  job.on('service-error-b').add('GITHUB::GIST::E3');

  job.on('service-error-c').add('GITHUB::GIST::C1');
  job.on('service-error-c').add('GITHUB::GIST::C2');
  job.on('service-error-c').add('GITHUB::GIST::C3');
                
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
          name: 'SERVICE-A::S2S::COMPLETED',
          from: 'service-error-a'
        }
      }
    } as TxJobExecutionOptions
  );        
  
}  

init();


