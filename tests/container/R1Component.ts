
import {TxTYPES} from "../../src/tx-injection-types";
import {inject, injectable} from "inversify";

@injectable()
export class R1Component {
  @inject(TxTYPES.TxRoutePoint) routepoint;

  constructor() {
  }

  async init() {
    await this.routepoint.route().connect('example-1.routepoint', 'R1Component.tasks');

    await this.routepoint.route().subscribe(
      async (data) => {
        console.log("[R1Component:subscribe] got data = " + data);
        await this.routepoint.route().next('example-2.routepoint', 'R2Component.tasks', {from: 'example-1.routepoint', data: 'data'});
      });

    return this;
  }

  print() {
    console.log("THIS IS R1Component");
  }
}
