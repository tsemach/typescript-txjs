
//import { TxMountPoint, TxMountPointRegistry, TxTask } from '../../../../src/';
import { TxMountPoint, TxMountPointRegistry, TxTask } from 'rx-txjs';

export class Q1Component {
  queuepoint: TxMountPoint = TxMountPointRegistry.instance.queue('GITHUB::API::AUTH');

  constructor() {
  }

  async init() {
    await this.queuepoint.tasks().connect('example-1.queuepoint', 'Q1Component.tasks');

    await this.queuepoint.tasks().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] data = " + JSON.stringify(data, undefined, 2));
        await this.queuepoint.tasks().next('example-2.queuepoint', 'Q2Component.tasks', {from: 'example-1.queuepoint', data: 'data'});
      });

    return this;
  }
}
