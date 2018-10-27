
import { TxQueuePointRegistry } from 'rx-txjs';

export class Q2Component {
  private queuepoint = TxQueuePointRegistry.instance.queue('GITHUB::API::READ');

  constructor() {
  }

  async init() {
    await this.queuepoint.queue().register('example-2.queuepoint', 'Q2Component.tasks');

    this.queuepoint.queue().subscribe(
      (data) => {
        console.log("[Q2Component:subscribe] got data = " + data);
      });
  }

  async send() {
    await this.queuepoint.queue().next('example-2.queuepoint', 'Q2Component.tasks', 'from Q2Component');
  }
  
}






