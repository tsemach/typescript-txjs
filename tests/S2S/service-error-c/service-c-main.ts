import createLogger from 'logging';
const logger = createLogger('service-error-c:main');

import { TxMountPointRegistry, TxJobRegistry } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';

import { C3Component } from '../components/C3.component';
import { C2Component } from '../components/C2.component';
import { C1Component } from '../components/C1.component';

TxJobRegistry.instance.setServiceName('service-error-c');

new C1Component();
new C2Component();
new C3Component();

async function init() {
  logger.info('[service-error-c:init] start service-error-c init');

  await new TxJobServicesComponent().init();  

  process.on('message', (msg) => {  
    logger.info('[service-error-c:init] message from parent:', msg);

    if (msg === 'service-error-c:run') {
      run();
    }
    if (msg === 'service-error-c:exit') {
      logger.info('[service-error-c:exit] service-error-c going to exist')

      process.exit(0);
    }
  });
  logger.info('[service-error-c:init] init completed');

  process.send('service-error-c:up')
}

init();


