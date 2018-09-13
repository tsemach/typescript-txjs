
import {Container, inject, injectable} from "inversify";
import "reflect-metadata";

import {TxTYPES} from "./tx-injection-types";
import {TxConnector} from "./tx-connector";
import {TxQueuePoint} from "./tx-queuepoint";
import {TxRoutePoint} from "./tx-routepoint";
import {TxConnectorRabbitMQ} from "./tx-connector-rabbitmq";
import {TxConnectorExpress} from "./tx-connector-express";

// const TxTYPES = {
//   TxQueuePoint: Symbol.for('TxQueuePoint'),
//   TxRoutePoint: Symbol.for('TxRoutePoint'),
//   TxConnector: Symbol.for("TxConnector"),
//   TxPointName: Symbol.for("TxPointName")
// };

// @injectable()
// export class TxQueuePoint {
//
//   @inject(TxTYPES.TxConnector) private _queue: TxConnector;
//   @inject(TxTYPES.TxPointName) private _name: string | Symbol = '';
//
//   constructor() {
//   }
//
//   // set name (_name: string | Symbol) {
//   //   this._name = _name;
//   // }
//
//   get name() {
//     return this._name;
//   }
//
//   queue() {
//     return this._queue;
//   }
//
// }

// @injectable()
// export class Q1Component {
//   @inject(TxTYPES.TxQueuePoint) queuepoint;
//
//   constructor() {
//   }
//
//   async init() {
//     await this.queuepoint.queue().connect('example-1.queuepoint', 'Q1Component.tasks');
//
//     await this.queuepoint.queue().subscribe(
//       async (data) => {
//         console.log("[Q1Component:subscribe] got data = " + data);
//         await this.queuepoint.queue().next('example-2.queuepoint', 'Q2Component.tasks', {from: 'example-1.queuepoint', data: 'data'});
//       });
//
//     return this;
//   }
//   print() {
//     console.log("THIS IS Q1Component");
//   }
// }
//
// @injectable()
// export class Q2Component {
//   @inject(TxTYPES.TxQueuePoint) queuepoint;
//
//   constructor() {
//   }
//
//   async init() {
//     await this.queuepoint.queue().connect('example-1.queuepoint', 'Q1Component.tasks');
//
//     await this.queuepoint.queue().subscribe(
//       async (data) => {
//         console.log("[Q1Component:subscribe] got data = " + data);
//         await this.queuepoint.queue().next('example-2.queuepoint', 'Q2Component.tasks', {from: 'example-1.queuepoint', data: 'data'});
//       });
//
//     return this;
//   }
//
//   print() {
//     console.log("THIS IS Q2Component");
//   }
// }
//
// @injectable()
// export class R1Component {
//   @inject(TxTYPES.TxRoutePoint) routepoint;
//
//   constructor() {
//   }
//
//   async init() {
//     await this.routepoint.queue().connect('example-1.queuepoint', 'R1Component.tasks');
//
//     await this.routepoint.queue().subscribe(
//       async (data) => {
//         console.log("[R1Component:subscribe] got data = " + data);
//         await this.routepoint.queue().next('example-2.queuepoint', 'R1Component.tasks', {from: 'example-1.routepoint', data: 'data'});
//       });
//
//     return this;
//   }
//   print() {
//     console.log("THIS IS R1Component");
//   }
// }
//
// @injectable()
// export class R2Component {
//   @inject(TxTYPES.TxRoutePoint) routepoint;
//
//   constructor() {
//   }
//
//   async init() {
//     await this.routepoint.queue().connect('example-1.routepoint', 'R2Component.tasks');
//
//     await this.routepoint.queue().subscribe(
//       async (data) => {
//         console.log("[Q1Component:subscribe] got data = " + data);
//         await this.routepoint.queue().next('example-2.routepoint', 'R12Component.tasks', {from: 'example-1.routepoint', data: 'data'});
//       });
//
//     return this;
//   }
//
//   print() {
//     console.log("THIS IS R2Component");
//   }
// }

export class TxComponentContainer<T> {
  // a container for TxConnector injection
  txContainer = new Container();

  // set the bind to himself and set driver binding.
  constructor(type, bind, driver) {
    this.txContainer.bind<T>(bind).to(type);
    this.txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(driver);
  }

  get(bind, name) {
    if (this.txContainer.isBound(TxTYPES.TxPointName)) {
      this.txContainer.unbind(TxTYPES.TxPointName);
    }
    this.txContainer.bind<string | Symbol>(TxTYPES.TxPointName).toConstantValue(name);

    return this.txContainer.get(bind);
  }

  addComponent<T>(type, bind) {
    this.txContainer.bind<T>(bind).to(type);
  }

  setDriver(driver) {
    if (this.txContainer.isBound(TxTYPES.TxConnector)) {
      this.txContainer.unbind(TxTYPES.TxConnector);
    }
    this.txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(driver);
  }
}

let TxQueueContainer = new TxComponentContainer<TxQueuePoint>(TxQueuePoint, TxTYPES.TxQueuePoint, TxConnectorRabbitMQ);
let TxRouteContainer = new TxComponentContainer<TxRoutePoint>(TxRoutePoint, TxTYPES.TxRoutePoint, TxConnectorExpress);

export { TxQueueContainer, TxRouteContainer }

// let qp;
// let rp;
//
// queueContainer.setDriver(TxConnectorRabbitMQ);
// queueContainer.addComponent<Q1Component>(Q1Component, 'Q1Component');
// queueContainer.addComponent<Q2Component>(Q2Component, 'Q2Component');
//
// qp = queueContainer.get('Q1Component', 'GITHUB:READ-2');
// console.log("name = " + qp.queuepoint.name.toString());
// qp.print();
//
// qp = queueContainer.get('Q2Component','GITHUB:READ-2-Q2');
// console.log("name = " + qp.queuepoint.name.toString());
//
// qp.print();
//
// routeContainer .setDriver(TxConnectorRabbitMQ);
// routeContainer .addComponent<R1Component>(R1Component, 'R1Component');
// routeContainer .addComponent<R2Component>(R2Component, 'R2Component');
//
// rp = routeContainer .get('R1Component', 'GITHUB:READ-ROUTE-R1');
// console.log("name = " + qp.queuepoint.name.toString());
// rp.print();
//
// rp = routeContainer .get('R2Component','GITHUB:READ-ROUTE-2-R2');
// console.log("name = " + qp.queuepoint.name.toString());
//
// rp.print();
