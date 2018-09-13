import {TxTYPES} from "../../src/tx-injection-types";
import {inject, injectable} from "inversify";

@injectable()
export class Q1Component {
  @inject(TxTYPES.TxQueuePoint) queuepoint;

  constructor() {
  }

  async init() {
    await this.queuepoint.queue().connect('example-1.queuepoint', 'Q1Component.tasks');

    await this.queuepoint.queue().subscribe(
      async (data) => {
        console.log("[Q1Component:subscribe] got data = " + data);
        await this.queuepoint.queue().next('example-2.queuepoint', 'Q2Component.tasks', {from: 'example-1.queuepoint', data: 'data'});
      });

    return this;
  }
  print() {
    console.log("THIS IS Q1Component");
  }
}
