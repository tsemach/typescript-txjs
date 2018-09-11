/**
 * A TypeScript module usng GitHub API
 */

import { TxMountPoint, TxMountPointRegistry } from '../../../../src/';

export class Q2Component {
  queuepoint: TxMountPoint = TxMountPointRegistry.instance.queue('GITHUB::API::READ');

  constructor() {
  }

  async init() {
    await this.queuepoint.tasks().connect('example-2.queuepoint', 'Q2Component.tasks');
    this.queuepoint.tasks().subscribe(
      (data) => {
        console.log("[Q2Component:subscribe] data = " + JSON.stringify(data, undefined, 2));
      });
  }

  async send() {
    await this.queuepoint.tasks().next('example-1.queuepoint', 'Q1Component.tasks', {from: 'example-2.queuepoint', data: 'data'});
  }
}






