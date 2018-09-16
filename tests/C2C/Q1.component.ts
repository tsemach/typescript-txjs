import createLogger from 'logging';
const logger = createLogger('Q1Component');

import { TxQueuePointRegistry } from '../../src/';

export class Q1Component {
  private queuepoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    await this.queuepoint.queue().connect('example-1.queuepoint', 'Q1Component.tasks');

    await this.queuepoint.queue().subscribe(
      async (data) => {
        logger.info("[Q1Component:subscribe] got data = " + data);
        await this.queuepoint.queue().next('example-2.queuepoint', 'Q2Component.tasks', {from: 'example-1.queuepoint', data: 'data'});
      });

    return this;
  }
}
