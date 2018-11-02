import createLogger from 'logging';
const logger = createLogger('service-error-b:main');

import { TxMountPointRegistry, TxJobRegistry } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';

import { E3Component } from '../components/E3.component';
import { E2Component } from '../components/E2.component';
import { E1Component } from '../components/E1.component';

TxJobRegistry.instance.setServiceName('service-error-b');

new E1Component();
new E2Component();
new E3Component();

async function init() {
  logger.info('[service-error-b:init] start service-error-b init');

  await new TxJobServicesComponent().init();  

  let mp = TxMountPointRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');
  mp.reply().subscribe(
    (task) => {
      //logger.info("run: status of TxJobServicesComponent: " + data.head);
      logger.info("[service-error-b:subscribe] got data from TxJobServicesComponent: " + JSON.stringify(task, undefined, 2));
      
      // notify the caller (the tester) that job is completed
      process.send({service: 'service-error-b', status: 'completed', task: task});
    }
  )

  process.on('message', (msg) => {  
    logger.info('[service-error-b:init] message from parent:', msg);
    
    if (msg === 'service-error-b:exit') {
      logger.info('[service-error-b:exit] service-error-b going to exist')

      process.exit(0);
    }

  });
  
  // notify the caller (the tester) that main is ready for commands
  process.send('service-error-b:up')

  logger.info('[service-error-b:init] init completed');
}

init();


