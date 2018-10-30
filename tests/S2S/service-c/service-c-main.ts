import createLogger from 'logging';
const logger = createLogger('service-c:main');

import { TxMountPointRegistry, TxJobRegistry } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';

import { C3Component } from './../C3.component';
import { C2Component } from './../C2.component';
import { C1Component } from './../C1.component';

TxJobRegistry.instance.setServiceName('service-c');

new C1Component();
new C2Component();
new C3Component();

async function init() {
  logger.info('[service-c:init] start service-c init');

  await new TxJobServicesComponent().init();  

  let mp = TxMountPointRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');
  mp.reply().subscribe(
    (task) => {
      logger.info("service-c: got data from TxJobServicesComponent: " + JSON.stringify(task, undefined, 2));
      
      // notify the caller (the tester) that job is completed
      process.send({service: 'service-c', status: 'completed', task: task});
    }
  )

  process.on('message', (msg) => {  
    logger.info('[service-c:init] message from parent:', msg);

    if (msg === 'service-c:run') {
      run();
    }
    if (msg === 'service-c:exit') {
      logger.info('[service-c:exit] service-c going to exist')

      process.exit(0);
    }
  });
  logger.info('[service-c:init] init completed');

  process.send('service-c:up')
}

// async function run() {
//   await new TxJobServicesComponent().init();  

//   let mp = TxMountPointRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');
//   mp.reply().subscribe(
//     (task) => {
//       logger.info("service-c: got data from TxJobServicesComponent: " + JSON.stringify(task, undefined, 2));
      
//       // notify the caller (the tester) that job is completed
//       process.send({service: 'service-c', status: 'completed', task: task});
//     }
//   )

//   // notify the caller (the tester) that main is ready for commands
//   process.send('service-c:up')
// }

init();


