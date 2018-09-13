import {TxTYPES} from "../../src/tx-injection-types";
import {inject, injectable} from "inversify";

@injectable()
export class QMember {
  @inject('QMember::name') name: string;

  constructor() {
  }

  getName() {
    return this.name;
  }
}

@injectable()
export class Q3Component {
  @inject(TxTYPES.TxQueuePoint) queuepoint;
  @inject('QMember') qmember: QMember;

  constructor() {
  }

  async init() {
    await this.queuepoint.queue().connect('example-1.queuepoint', 'Q3Component.tasks');

    await this.queuepoint.queue().subscribe(
      async (data) => {
        console.log("[Q3Component:subscribe] got data = " + data);
        await this.queuepoint.queue().next('example-2.queuepoint', 'Q2Component.tasks', {from: 'example-1.queuepoint', data: 'data'});
      });

    return this;
  }

  description() {
    return "This is Q3Component";
  }

  getQMemberName() {
    return this.qmember.getName();
  }
}
