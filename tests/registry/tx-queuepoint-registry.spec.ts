
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

import { TxMountPointRegistry } from '../../src/';
import { TxQueuePointRegistry } from '../../src/';
import { TxConnector } from "../../src/";
import { TxConnectorRabbitMQ } from "../../src/tx-connector-rabbitmq";
import { TxConnectorExpress } from "../../src/tx-connector-express";

@injectable()
export class TxConnectorNoDefaultRabbitMQ implements TxConnector {
  subscribeBC: (any) => void;

  id = uuid();
  constructor() {

  }

  listen(service: any, route: any) {
    console.log(`TxConnectorNoDefaultRabbitMQ: ${service}-${route}-${this.id}`);
  }

  subscribe(cb: (any) => void) {
    this.subscribeBC = cb;
    console.log("subscribe: TxConnectorNoDefaultRabbitMQ Method not implemented.");
  };

  next(service: string, route: string, data: any) {
    this.subscribeBC(data);
    console.log("next: TxConnectorNoDefaultRabbitMQ Method not implemented.");
  }

  error(service: string, route: string, data: any) {
    this.subscribeBC(data);
    console.log("next: TxConnectorNoDefaultExpress Method not implemented.");
  }

  close() {
  }

}

@injectable()
export class TxConnectorNoDefaultExpress implements TxConnector {
  subscribeBC: (any) => void;

  id = uuid();
  constructor() {

  }
  listen(service: any, route: any) {
    console.log(`TxConnectorNoDefaultExpress: ${service}-${route}-${this.id}`);
  }

  subscribe(cb: (any) => void) {
    this.subscribeBC = cb;
    console.log("subscribe: TxConnectorNoDefaultExpress Method not implemented.");
  };

  next(service: string, route: string, data: any) {
    this.subscribeBC(data);
    console.log("next: TxConnectorNoDefaultExpress Method not implemented.");
  }

  error(service: string, route: string, data: any) {
    this.subscribeBC(data);
    console.log("next: TxConnectorNoDefaultExpress Method not implemented.");
  }
  
  close() {
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

  it('tx-queuetpoint.spec: check creation of TxQueuePoint with default RabbitMQ connector injection', async () => {
    logger.info('tx-queuetpoint.spec: check creation of TxQueuePoint with default RabbitMQ connector injection');

    const QP1 = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');
    const QP2 = TxQueuePointRegistry.instance.queue('GITHUB::API::READ');

    expect(QP1.name).to.equal('GITHUB::API::AUTH');
    expect(QP2.name).to.equal('GITHUB::API::READ');

    await QP1.queue().listen('CP1', 'tasks:connect');
    await QP2.queue().listen('CP2', 'tasks:connect');

    let set = new Set<string>();
    set.add((<TxConnectorRabbitMQ>QP1.queue()).id);
    set.add((<TxConnectorRabbitMQ>QP2.queue()).id);

    logger.info("(<TxConnectorRabbitMQ>QP1.queue()).id = " + (<TxConnectorRabbitMQ>QP1.queue()).id)
    logger.info("(<TxConnectorRabbitMQ>QP2.queue()).id = " + (<TxConnectorRabbitMQ>QP2.queue()).id);

    // make sure they all the same UUIDs, because the connector is singleton.
    expect(set.size).to.equal(1);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorRabbitMQ>QP1.queue()).id));
    assert(isUUID((<TxConnectorRabbitMQ>QP2.queue()).id));

    QP1.queue().close('CP1');
    QP1.queue().close('CP2');
  });

  it('tx-queuetpoint-registry.spec: check creation of TxQueuePoint with RabbitMQ connector injection', () => {
    logger.info('tx-queuetpoint-registry.spec: check creation of TxQueuePoint with RabbitMQ connector injection');

    TxQueuePointRegistry.instance.setDriver(TxConnectorNoDefaultRabbitMQ);

    const QP1 = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');
    const QP2 = TxQueuePointRegistry.instance.queue('GITHUB::API::READ');

    expect(QP1.name).to.equal('GITHUB::API::AUTH');
    expect(QP2.name).to.equal('GITHUB::API::READ');

    QP1.queue().listen('CP1', 'tasks:connect');
    QP2.queue().listen('CP2', 'tasks:connect');

    let set = new Set<string>();
    set.add((<TxConnectorNoDefaultRabbitMQ>QP1.queue()).id);
    set.add((<TxConnectorNoDefaultRabbitMQ>QP2.queue()).id);

    // make sure they all different UUIDs.
    expect(set.size).to.equal(1);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorNoDefaultRabbitMQ>QP1.queue()).id));
    assert(isUUID((<TxConnectorNoDefaultRabbitMQ>QP2.queue()).id));
  });

  it('tx-queuetpoint-registry.spec: check calling to subscribe on TxQueuePoint with RabbitMQ', (done) => {
    logger.info('tx-queuetpoint-registry.spec: check calling to subscribe on TxQueuePoint with RabbitMQ');

    TxQueuePointRegistry.instance.setDriver(TxConnectorNoDefaultRabbitMQ);

    const QP1 = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');
    const QP2 = TxQueuePointRegistry.instance.queue('GITHUB::API::READ');

    expect(QP1.name).to.equal('GITHUB::API::AUTH');
    expect(QP2.name).to.equal('GITHUB::API::READ');

    QP1.queue().listen('service-a', 'tasks.component')

    QP1.queue().subscribe((data) => {
      console.log("[QP1:subscribe] data = " + JSON.stringify(data, undefined, 2));
      done();
    });

    QP1.queue().next('service-a', 'tasks.#', {from: 'service-a', data: 'data'});

  });

  it('tx-queuepoint-registry.spec: just exit', (done) => {
    logger.info('tx-queuepoint-registry.spec: just exit');

    done();
    setTimeout(() => {
      process.exit(0);
    }, 2000)

  });

});
