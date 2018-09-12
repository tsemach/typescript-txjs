
import { TxQueuePoint, TxQueuePointRegistry } from '../../src';

export class Q1Component {
  queuepoint: TxQueuePoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    await this.queuepoint.queue().connect('service-1.queuepoint', 'Q1Component.tasks');

    await this.queuepoint.queue().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] got data = " + data);
        await this.queuepoint.queue().next('service-2.queuepoint', 'Q2Component.tasks', {from: 'service-1.queuepoint', data: 'data'});
      });

    return this;
  }
}
