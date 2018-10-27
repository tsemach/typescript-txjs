import createLogger from 'logging';
const logger = createLogger('TxJobServicesComponent');

import { TxQueuePointRegistry } from './tx-queuepoint-registry';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxJobRegistry } from './tx-job-resgitry';

/**
 * S2S - 
 */
export class TxJobServicesComponent {
  mountpoint = TxMountPointRegistry.instance.create('JOB::SERVICES::MOUNTPOINT::COMPONENT');
  queuepoint = TxQueuePointRegistry.instance.create('JOB::SERVICES::QUEUEPOINT::COMPONENT');

  constructor() {    
  }

  async init() {
    logger.info('[TxJobServicesComponent] init is called');
    
    // subscribe to inporcess incoming messages that need to send over the queue
    this.mountpoint.tasks().subscribe(
      async (task) => {
        logger.info('[TxJobServicesComponent] mountpoint: got task - ', JSON.stringify(task, undefined, 2));
        logger.info('[TxJobServicesComponent] task.head.next - ', task.head.next);

        await this.queuepoint.queue().next(task.head.next, 'job.services', task); 
    })

    // subscribe to incoming messages from other services from qeueu  
    logger.info('TxJobServicesComponent: register on [' + TxJobRegistry.instance.getServiceName() + ']=[' + 'job.services]')
    await this.queuepoint.queue().register(TxJobRegistry.instance.getServiceName(), 'job.services');
    await this.queuepoint.queue().subscribe(      
    async (data) => {
      logger.info("[TxJobServicesComponent:subscribe] got data = ", JSON.stringify(JSON.parse(data), undefined, 2));
    });

    return this;
  }

  // send(task) {
  //   // await this.queuepoint.queue().next('service-2.queuepoint', 'Q2Component.tasks', {from: 'service-1.queuepoint', data: 'data'});
  // }

}
