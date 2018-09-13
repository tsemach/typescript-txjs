import {TxTYPES} from "../../src/tx-injection-types";
import {inject, injectable} from "inversify";

@injectable()
export class RMember {
  @inject('RMember::name') _name: string;

  constructor() {
  }

  get name() {
    return this._name;
  }
}

@injectable()
export class R3Component {
  @inject(TxTYPES.TxRoutePoint) routepoint;
  @inject('RMember') rmember: RMember;

  constructor() {
  }

  async init() {
    await this.routepoint.queue().connect('example-1.queuepoint', 'R3Component.tasks');

    await this.routepoint.route().subscribe(
      async (data) => {
        console.log("[R3Component:subscribe] got data = " + data);
        await this.routepoint.route().next('example-2.queuepoint', 'Q2Component.tasks', {from: 'example-1.queuepoint', data: 'data'});
      });

    return this;
  }

  description() {
    return "This is R3Component";
  }

  getRMemberName() {
    return this.rmember.name;
  }
}
