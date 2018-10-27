import createLogger from 'logging';
const logger = createLogger('TxJobServicesComponent');

import { TxQueuePointRegistry } from './tx-queuepoint-registry';
import { TxJobRegistry } from './tx-job-resgitry';

/**
 * S2S - 
 */
export class TxJobServicesComponent {
  queuepoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    await this.queuepoint.queue().register(TxJobRegistry.instance.getServiceName(), 'job.services');

    await this.queuepoint.queue().subscribe(
      async (data) => {
        logger.info("[TxJobServicesComponent:subscribe] got data = " + data);
      });

    return this;
  }

  send(task) {
    // await this.queuepoint.queue().next('service-2.queuepoint', 'Q2Component.tasks', {from: 'service-1.queuepoint', data: 'data'});
  }

}
