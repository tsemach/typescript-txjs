import createLogger from 'logging';
const logger = createLogger('service-a:main');
//const { fork } = require('child_process');

import { TxMountPointRegistry, TxJobRegistry, TxQueuePointRegistry } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';

import { A3Component } from '../components/A3.component';
import { A2Component } from '../components/A2.component';
import { A1Component } from '../components/A1.component';

process.on('message', (msg) => {  
  logger.log('main: message from parent:', msg);

  if (msg === 'exist') {
    process.exit(0);
  }
});

TxJobRegistry.instance.setServiceName('service-a');

new A1Component();
new A2Component();
new A3Component();

async function run() {
  await new TxJobServicesComponent().init();  

  let mp = TxMountPointRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');
  mp.reply().subscribe(
    (data) => {
      //logger.info("run: status of TxJobServicesComponent: " + data.head);
      logger.info("run: got data from TxJobServicesComponent: " + JSON.stringify(data, undefined, 2));
      
      // notify the caller (the tester) that job is completed
      process.send('main:completed');
    }
  )

  // notify the caller (the tester) that main is ready for commands
  process.send('main:up')
}

run();


