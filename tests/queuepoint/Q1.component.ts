
import { TxMountPoint, TxMountPointRegistry } from '../../src';

export class Q1Component {
  queuepoint: TxMountPoint = TxMountPointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    await this.queuepoint.tasks().connect('service-1.queuepoint', 'Q1Component.tasks');

    await this.queuepoint.tasks().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] got data = " + data);
        await this.queuepoint.tasks().next('service-2.queuepoint', 'Q2Component.tasks', {from: 'service-1.queuepoint', data: 'data'});
      });

    return this;
  }
}
