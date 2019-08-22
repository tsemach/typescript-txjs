import createLogger from 'logging';
const logger = createLogger('service-c:main');

import { TxMountPointRegistry, TxJobRegistry } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';

import { C3Component } from '../components/C3.component';
import { C2Component } from '../components/C2.component';
import { C1Component } from '../components/C1.component';

import { TxQueuePointRegistry } from '../../../src/tx-queuepoint-registry'
import { TxRoutePointRegistry} from '../../../src/tx-routepoint-registry'

import { TxConnectorRabbitMQ } from '../../connectors/connector-rabbitmq-empty';
import { TxConnectorExpress } from '../../connectors/connector-express-full';

TxQueuePointRegistry.instance.setDriver(TxConnectorRabbitMQ);
//TxRoutePointRegistry.instance.setDriver(TxConnectorExpress);

TxJobRegistry.instance.setServiceName('service-c');

new C1Component();
new C2Component();
new C3Component();

async function init() {
  logger.info('[service-c:init] start service-c init');

  await new TxJobServicesComponent().init();  

  let mp = TxMountPointRegistry.instance.create('SERVICE-C::JOB::COMPLETED');
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

init();


