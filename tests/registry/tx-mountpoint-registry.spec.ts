
import createLogger from 'logging';
const logger = createLogger('MountPoint-Registry-Test');

import * as short from 'short-uuid';
const translator = short();

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';
import * as isUUID from 'validator/lib/isUUID';
import * as uuid from 'uuid/v4';

import {injectable} from "inversify";
import "reflect-metadata";

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxConnector } from "../../src/tx-connector";
import { TxConnectorRabbitMQ } from "../../src/tx-connector-rabbitmq";
import { TxConnectorExpress } from "../../src/tx-connector-express";

@injectable()
export class TxConnectorNoDefaultRabbitMQ implements TxConnector {
  subscribeBC: (any) => void;

  id = uuid();
  constructor() {

  }
  connect(service: any, route: any) {
    console.log(`TxConnectorNoDefaultRabbitMQ: ${service}-${route}-${this.id}`);
  }

  subscribe(cb: (any) => void) {
    this.subscribeBC = cb;
    console.log("subscribe: TxConnectorNoDefaultRabbitMQ Method not implemented.");
  };

  next(any: any) {
    this.subscribeBC(any);
    console.log("next: TxConnectorNoDefaultRabbitMQ Method not implemented.");
  }
}

@injectable()
export class TxConnectorNoDefaultExpress implements TxConnector {
  subscribeBC: (any) => void;

  id = uuid();
  constructor() {

  }
  connect(service: any, route: any) {
    console.log(`TxConnectorNoDefaultExpress: ${service}-${route}-${this.id}`);
  }

  subscribe(cb: (any) => void) {
    this.subscribeBC = cb;
    console.log("subscribe: TxConnectorNoDefaultExpress Method not implemented.");
  };

  next(any: any) {
    this.subscribeBC(any);
    console.log("next: TxConnectorNoDefaultExpress Method not implemented.");
  }
}

describe('Registry Classes - TxMountPointRegitry', () => {
  
  before(function() {
    translator.new();
  });

  it('tx-mountpoint-registry.spec: check TxMountPointRegistry', () => {
    let n = translator.new()
    logger.info('short.uuid()        = ' + short.uuid());
    logger.info('translator.new()    = ' + n);
    logger.info('translator.toUUID   = ' + translator.toUUID(n));
    logger.info('translator.fromUUID = ' + translator.fromUUID('08690cfa-95df-4c76-aa3b-fb715830d6e4'));
    logger.info('translator.fromUUID = ' + short().new());
    
    let MP1 = TxMountPointRegistry.instance.create('WORK::C1');
    let MP2 = TxMountPointRegistry.instance.get('WORK::C1');

     expect(MP1.name).to.equal('WORK::C1');
     expect(MP2.name).to.equal('WORK::C1');
  });

  it('tx-mountpoint-registry.spec: check TxJobRegistry', () => {
   

  });

  it('tx-mountpoint.spec: check creation of TxQueuePoint with default RabbitMQ connector injection', () => {
    logger.info('tx-mountpoint.spec: check creation of TxQueuePoint with default RabbitMQ connector injection');

    const QP1 = TxMountPointRegistry.instance.queue('GITHUB::API::AUTH');
    const QP2 = TxMountPointRegistry.instance.queue('GITHUB::API::READ');

    expect(QP1.name).to.equal('GITHUB::API::AUTH');
    expect(QP2.name).to.equal('GITHUB::API::READ');

    QP1.tasks().connect('CP1', 'tasks:connect');
    QP1.reply().connect('CP1', 'reply:connect');
    QP1.undos().connect('CP1', 'undos:connect');

    QP2.tasks().connect('CP2', 'tasks:connect');
    QP2.reply().connect('CP2', 'reply:connect');
    QP2.undos().connect('CP2', 'undos:connect');

    let set = new Set<string>();
    set.add((<TxConnectorRabbitMQ>QP1.tasks()).id);
    set.add((<TxConnectorRabbitMQ>QP1.reply()).id);
    set.add((<TxConnectorRabbitMQ>QP1.undos()).id);
    set.add((<TxConnectorRabbitMQ>QP2.tasks()).id);
    set.add((<TxConnectorRabbitMQ>QP2.reply()).id);
    set.add((<TxConnectorRabbitMQ>QP2.undos()).id);

    // make sure they all different UUIDs.
    expect(set.size).to.equal(6);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorRabbitMQ>QP1.tasks()).id));
    assert(isUUID((<TxConnectorRabbitMQ>QP1.reply()).id));
    assert(isUUID((<TxConnectorRabbitMQ>QP1.undos()).id));
    assert(isUUID((<TxConnectorRabbitMQ>QP2.tasks()).id));
    assert(isUUID((<TxConnectorRabbitMQ>QP2.reply()).id));
    assert(isUUID((<TxConnectorRabbitMQ>QP2.undos()).id));
  });

  it('tx-mountpoint.spec: check creation of TxRoutePoint with default Express connector injection', () => {
    logger.info('tx-mountpoint.spec: check creation of TxRoutePoint with default Express connector injection');

    const RP1 = TxMountPointRegistry.instance.route('GITHUB::API::AUTH');
    const RP2 = TxMountPointRegistry.instance.route('GITHUB::API::READ');

    expect(RP1.name).to.equal('GITHUB::API::AUTH');
    expect(RP2.name).to.equal('GITHUB::API::READ');

    RP1.tasks().connect('CP1', 'tasks:connect');
    RP1.reply().connect('CP1', 'reply:connect');
    RP1.undos().connect('CP1', 'undos:connect');

    RP2.tasks().connect('CP2', 'tasks:connect');
    RP2.reply().connect('CP2', 'reply:connect');
    RP2.undos().connect('CP2', 'undos:connect');

    let set = new Set<string>();
    set.add((<TxConnectorExpress>RP1.tasks()).id);
    set.add((<TxConnectorExpress>RP1.reply()).id);
    set.add((<TxConnectorExpress>RP1.undos()).id);
    set.add((<TxConnectorExpress>RP2.tasks()).id);
    set.add((<TxConnectorExpress>RP2.reply()).id);
    set.add((<TxConnectorExpress>RP2.undos()).id);

    // make sure they all different UUIDs.
    expect(set.size).to.equal(6);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorExpress>RP1.tasks()).id));
    assert(isUUID((<TxConnectorExpress>RP1.reply()).id));
    assert(isUUID((<TxConnectorExpress>RP1.undos()).id));
    assert(isUUID((<TxConnectorExpress>RP2.tasks()).id));
    assert(isUUID((<TxConnectorExpress>RP2.reply()).id));
    assert(isUUID((<TxConnectorExpress>RP2.undos()).id));
  });

  it('tx-mountpoint.spec: check creation of TxQueuePoint with RabbitMQ connector injection', () => {
    logger.info('tx-mountpoint.spec: check creation of TxQueuePoint with RabbitMQ connector injection');

    TxMountPointRegistry.instance.setQueueDriver(TxConnectorNoDefaultRabbitMQ);

    const QP1 = TxMountPointRegistry.instance.queue('GITHUB::API::AUTH');
    const QP2 = TxMountPointRegistry.instance.queue('GITHUB::API::READ');

    expect(QP1.name).to.equal('GITHUB::API::AUTH');
    expect(QP2.name).to.equal('GITHUB::API::READ');

    QP1.tasks().connect('CP1', 'tasks:connect');
    QP1.reply().connect('CP1', 'reply:connect');
    QP1.undos().connect('CP1', 'undos:connect');

    QP2.tasks().connect('CP2', 'tasks:connect');
    QP2.reply().connect('CP2', 'reply:connect');
    QP2.undos().connect('CP2', 'undos:connect');

    let set = new Set<string>();
    set.add((<TxConnectorNoDefaultRabbitMQ>QP1.tasks()).id);
    set.add((<TxConnectorNoDefaultRabbitMQ>QP1.reply()).id);
    set.add((<TxConnectorNoDefaultRabbitMQ>QP1.undos()).id);
    set.add((<TxConnectorNoDefaultRabbitMQ>QP2.tasks()).id);
    set.add((<TxConnectorNoDefaultRabbitMQ>QP2.reply()).id);
    set.add((<TxConnectorNoDefaultRabbitMQ>QP2.undos()).id);

    // make sure they all different UUIDs.
    expect(set.size).to.equal(6);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorNoDefaultRabbitMQ>QP1.tasks()).id));
    assert(isUUID((<TxConnectorNoDefaultRabbitMQ>QP1.reply()).id));
    assert(isUUID((<TxConnectorNoDefaultRabbitMQ>QP1.undos()).id));
    assert(isUUID((<TxConnectorNoDefaultRabbitMQ>QP2.tasks()).id));
    assert(isUUID((<TxConnectorNoDefaultRabbitMQ>QP2.reply()).id));
    assert(isUUID((<TxConnectorNoDefaultRabbitMQ>QP2.undos()).id));
  });

  it('tx-mountpoint.spec: check creation of TxRoutePoint with Express connector injection', () => {
    logger.info('tx-mountpoint.spec: check creation of TxRoutePoint with Express connector injection');

    TxMountPointRegistry.instance.setRouteDriver(TxConnectorNoDefaultExpress);

    const RP1 = TxMountPointRegistry.instance.route('GITHUB::API::AUTH');
    const RP2 = TxMountPointRegistry.instance.route('GITHUB::API::READ');

    expect(RP1.name).to.equal('GITHUB::API::AUTH');
    expect(RP2.name).to.equal('GITHUB::API::READ');

    RP1.tasks().connect('CP1', 'tasks:connect');
    RP1.reply().connect('CP1', 'reply:connect');
    RP1.undos().connect('CP1', 'undos:connect');

    RP2.tasks().connect('CP2', 'tasks:connect');
    RP2.reply().connect('CP2', 'reply:connect');
    RP2.undos().connect('CP2', 'undos:connect');

    let set = new Set<string>();
    set.add((<TxConnectorNoDefaultExpress>RP1.tasks()).id);
    set.add((<TxConnectorNoDefaultExpress>RP1.reply()).id);
    set.add((<TxConnectorNoDefaultExpress>RP1.undos()).id);
    set.add((<TxConnectorNoDefaultExpress>RP2.tasks()).id);
    set.add((<TxConnectorNoDefaultExpress>RP2.reply()).id);
    set.add((<TxConnectorNoDefaultExpress>RP2.undos()).id);

    // make sure they all different UUIDs.
    expect(set.size).to.equal(6);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorNoDefaultExpress>RP1.tasks()).id));
    assert(isUUID((<TxConnectorNoDefaultExpress>RP1.reply()).id));
    assert(isUUID((<TxConnectorNoDefaultExpress>RP1.undos()).id));
    assert(isUUID((<TxConnectorNoDefaultExpress>RP2.tasks()).id));
    assert(isUUID((<TxConnectorNoDefaultExpress>RP2.reply()).id));
    assert(isUUID((<TxConnectorNoDefaultExpress>RP2.undos()).id));
  });

});
