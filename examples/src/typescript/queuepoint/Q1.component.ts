
import { TxMountPoint, TxQueuePointRegistry } from 'rx-txjs';

export class Q1Component {
  private queuepoint = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    await this.queuepoint.queue().register('example-1.queuepoint', 'Q1Component.tasks');

    await this.queuepoint.queue().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] got data = " + data);
        await this.queuepoint.queue().next('example-2.queuepoint', 'Q2Component.tasks', {from: 'example-1.queuepoint', data: data});
      });
    

    return this;
  }
}
