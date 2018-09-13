
import {TxTYPES} from "../../src/tx-injection-types";
import {inject, injectable} from "inversify";

@injectable()
export class R2Component {
  @inject(TxTYPES.TxRoutePoint) routepoint;

  constructor() {
  }

  async init() {
    await this.routepoint.route().connect('example-1.routepoint', 'R2Component.tasks');

    await this.routepoint.route().subscribe(
      async (data) => {
        console.log("[R2Component:subscribe] got data = " + data);
        await this.routepoint.route().next('example-2.routepoint', 'R2Component.tasks', {from: 'example-1.routepoint', data: 'data'});
      });

    return this;
  }

  print() {
    console.log("THIS IS R2Component");
  }
}