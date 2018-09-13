
import {Container, inject, injectable} from "inversify";
import "reflect-metadata";

import {TxConnector} from "../../src/tx-connector";
import {TxQueuePoint} from "../../src";
import {TxConnectorRabbitMQ} from "../../src/tx-connector-rabbitmq";

const TxTYPES = {
  TxQueuePoint: Symbol.for('TxQueuePoint'),
  TxConnector: Symbol.for("TxConnector"),
  TxPointName: Symbol.for("TxPointName")
};

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
}

// export class TxComponentContainer<T> {
//   // a container for TxConnector injection
//   txContainer = new Container();
//   bind: any;
//
//   // set the bind to himself.
//   constructor(type, bind) {
//     this.txContainer.bind<T>(bind).to(type);
//     this.txContainer.bind<TxQueuePoint>(TxTYPES.TxQueuePoint).to(TxQueuePoint);
//     this.txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(TxConnectorRabbitMQ);
//     this.txContainer.bind<string | Symbol>(TxTYPES.TxPointName).toConstantValue(Symbol('GITHUB::AUTH'));
//
//     this.bind = bind;
//   }
//
//   get() {
//     return this.txContainer.get<T>(this.bind);
//   }
//
// }
export class TxRegistryContainer<T, M> {
  // a container for TxConnector injection
  txContainer = new Container();
  bind: any;

  // set the bind to himself.
  constructor(type, bind) {
    this.txContainer.bind<T>(bind).to(type);
    this.txContainer.bind<TxQueuePoint>(TxTYPES.TxQueuePoint).to(TxQueuePoint);

    this.bind = bind;
  }

  get(name) {
    if (this.txContainer.isBound(TxTYPES.TxPointName)) {
      this.txContainer.unbind(TxTYPES.TxPointName);
    }
    this.txContainer.bind<string | Symbol>(TxTYPES.TxPointName).toConstantValue(name);

    return this.txContainer.get<T>(this.bind);
  }

  setDriver(type) {
    if ( this.txContainer.isBound(TxTYPES.TxConnector)) {
      this.txContainer.unbind(TxTYPES.TxConnector);
    }
    this.txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(type);
  }
}

let queueContainer = new TxRegistryContainer<Q1Component, TxQueuePoint>(Q1Component, "Q1Component");
queueContainer.setDriver(TxConnectorRabbitMQ);

let qp = queueContainer.get('GITHUB:READ');
console.log("name = " + qp.queuepoint.name.toString());
// qp.queuepoint.name = 'aaa';
console.log("name = " + qp.queuepoint.name.toString());
