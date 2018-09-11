
//import logger = require('logging');
import createLogger from 'logging';
const logger = createLogger('TxQueuePoint-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';
import * as isUUID from 'validator/lib/isUUID';

import {Container, injectable} from "inversify";
import "reflect-metadata";
import * as uuid from 'uuid/v4';

import { TxTYPES } from "../../src/tx-injection-types";
import { TxConnector } from "../../src/tx-connector";
import { TxQueuePoint } from "../../src/tx-queuepoint";

@injectable()
export class TxConnectorRabbitMQ implements TxConnector {
  subscribeBC: (any) => void;

  id = uuid();
  constructor() {

  }
  connect(service: any, route: any) {
    console.log(`TxConnectorRabbit: ${service}-${route}-${this.id}`);
  }

  subscribe(cb: (any) => void) {
    this.subscribeBC = cb;
    console.log("subscribe: TxConnectorRabbit Method not implemented.");
  };

  next(service: string, route: string, data: any) {
    this.subscribeBC(data);
    console.log("next: TxConnectorRabbit Method not implemented.");
  }

  close() {
  }
}

describe('Queue Point Class', () => {

  it('tx-queue-point.spec: try inject TxConnectorRabbitMQ to TxQueuePoint', () => {
    logger.info('tx-queue-point.spec: try inject TxConnectorRabbitMQ to TxQueuePoint');
    let set = new Set<string>();

    const txContainer = new Container();
    txContainer.bind<TxQueuePoint>(TxTYPES.TxQueuePoint).to(TxQueuePoint);
    txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(TxConnectorRabbitMQ);

    const CP1 = txContainer.get<TxQueuePoint>(TxTYPES.TxQueuePoint);
    const CP2 = txContainer.get<TxQueuePoint>(TxTYPES.TxQueuePoint);

    CP1.tasks().connect('CP1', 'tasks:connect');
    CP1.reply().connect('CP1', 'reply:connect');
    CP1.undos().connect('CP1', 'undos:connect');

    CP2.tasks().connect('CP2', 'tasks:connect');
    CP2.reply().connect('CP2', 'reply:connect');
    CP2.undos().connect('CP2', 'undos:connect');

    set.add((<TxConnectorRabbitMQ>CP1.tasks()).id);
    set.add((<TxConnectorRabbitMQ>CP1.reply()).id);
    set.add((<TxConnectorRabbitMQ>CP1.undos()).id);
    set.add((<TxConnectorRabbitMQ>CP2.tasks()).id);
    set.add((<TxConnectorRabbitMQ>CP2.reply()).id);
    set.add((<TxConnectorRabbitMQ>CP2.undos()).id);

    // make sure they all different UUIDs.
    expect(set.size).to.equal(6);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorRabbitMQ>CP1.tasks()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP1.reply()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP1.undos()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP2.tasks()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP2.reply()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP2.undos()).id));
  });

  it('tx-queue-point.spec: binding TxConnectorRabbitMQ by variable', () => {
    logger.info('tx-queue-point.spec: binding TxConnectorRabbitMQ by variable')
    const txContainer = new Container();
    txContainer.bind<TxQueuePoint>(TxTYPES.TxQueuePoint).to(TxQueuePoint);

    // bind TxConnectorRabbitMQ to TxTYPES.TxConnector as TxConnector
    function bind(type) {
      txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(type);

      return txContainer;
    }
    bind(TxConnectorRabbitMQ);

    const CP1 = txContainer.get<TxQueuePoint>(TxTYPES.TxQueuePoint);
    const CP2 = txContainer.get<TxQueuePoint>(TxTYPES.TxQueuePoint);

    CP1.tasks().connect('CP1', 'tasks:connect');
    CP1.reply().connect('CP1', 'reply:connect');
    CP1.undos().connect('CP1', 'undos:connect');

    CP2.tasks().connect('CP2', 'tasks:connect');
    CP2.reply().connect('CP2', 'reply:connect');
    CP2.undos().connect('CP2', 'undos:connect');

    let set = new Set<string>();
    set.add((<TxConnectorRabbitMQ>CP1.tasks()).id);
    set.add((<TxConnectorRabbitMQ>CP1.reply()).id);
    set.add((<TxConnectorRabbitMQ>CP1.undos()).id);
    set.add((<TxConnectorRabbitMQ>CP2.tasks()).id);
    set.add((<TxConnectorRabbitMQ>CP2.reply()).id);
    set.add((<TxConnectorRabbitMQ>CP2.undos()).id);

    // make sure they all different UUIDs.
    expect(set.size).to.equal(6);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorRabbitMQ>CP1.tasks()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP1.reply()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP1.undos()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP2.tasks()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP2.reply()).id));
    assert(isUUID((<TxConnectorRabbitMQ>CP2.undos()).id));
  });

});