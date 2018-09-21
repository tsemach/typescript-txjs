
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

import { TxRoutePointRegistry } from '../../src/';
import { TxConnector } from "../../src/";
import { TxConnectorRabbitMQ } from "../../src/tx-connector-rabbitmq";
import { TxConnectorExpress } from "../../src/tx-connector-express";

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

  next(service: string, route: string, data: any) {
    this.subscribeBC(data);
    console.log("next: TxConnectorNoDefaultExpress Method not implemented.");
  }

  close() {
  }
}

describe('Registry Classes - TxRoutePointRegitry', () => {

  it('tx-routepoint.spec: check creation of TxQueuePoint with default RabbitMQ connector injection', async () => {
    logger.info('tx-routepoint.spec: check creation of TxQueuePoint with default RabbitMQ connector injection');

    const RP1 = TxRoutePointRegistry.instance.route('GITHUB::API::AUTH');
    const RP2 = TxRoutePointRegistry.instance.route('GITHUB::API::READ');

    expect(RP1.name).to.equal('GITHUB::API::AUTH');
    expect(RP2.name).to.equal('GITHUB::API::READ');

    await RP1.route().connect('CP1', 'tasks:connect');
    await RP2.route().connect('CP2', 'tasks:connect');

    let set = new Set<string>();
    set.add((<TxConnectorRabbitMQ>RP1.route()).id);
    set.add((<TxConnectorRabbitMQ>RP2.route()).id);

    // make sure they all the same UUIDs, because the connector is singleton.
    expect(set.size).to.equal(1);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorRabbitMQ>RP1.route()).id));
    assert(isUUID((<TxConnectorRabbitMQ>RP2.route()).id));

    RP1.route().close();
  });

  it('tx-routepoint.spec: check creation of TxRoutePoint with default Express connector injection', () => {
    logger.info('tx-routepoint.spec: check creation of TxRoutePoint with default Express connector injection');

    const RP1 = TxRoutePointRegistry.instance.route('GITHUB::API::AUTH');
    const RP2 = TxRoutePointRegistry.instance.route('GITHUB::API::READ');

    expect(RP1.name).to.equal('GITHUB::API::AUTH');
    expect(RP2.name).to.equal('GITHUB::API::READ');

    RP1.route().connect('CP1', 'tasks:connect');
    RP2.route().connect('CP2', 'tasks:connect');

    let set = new Set<string>();
    set.add((<TxConnectorExpress>RP1.route()).id);
    set.add((<TxConnectorExpress>RP2.route()).id);

    // make sure they all the same UUIDs, because the connector is singleton.
    expect(set.size).to.equal(1);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorExpress>RP1.route()).id));
    assert(isUUID((<TxConnectorExpress>RP2.route()).id));
  });

  it('tx-routepoint.spec: check creation of TxRoutePoint with Express connector injection', () => {
    logger.info('tx-routepoint.spec: check creation of TxRoutePoint with Express connector injection');

    TxRoutePointRegistry.instance.setDriver(TxConnectorNoDefaultExpress);

    const RP1 = TxRoutePointRegistry.instance.route('GITHUB::API::AUTH');
    const RP2 = TxRoutePointRegistry.instance.route('GITHUB::API::READ');

    expect(RP1.name).to.equal('GITHUB::API::AUTH');
    expect(RP2.name).to.equal('GITHUB::API::READ');

    RP1.route().connect('CP1', 'tasks:connect');
    RP2.route().connect('CP2', 'tasks:connect');

    let set = new Set<string>();
    set.add((<TxConnectorNoDefaultExpress>RP1.route()).id);
    set.add((<TxConnectorNoDefaultExpress>RP2.route()).id);

    // make sure they all the same UUIDs, because the connector is singleton.
    expect(set.size).to.equal(1);

    // make sure they all valid UUID
    assert(isUUID((<TxConnectorNoDefaultExpress>RP1.route()).id));
    assert(isUUID((<TxConnectorNoDefaultExpress>RP2.route()).id));
  });

  it('tx-routepoint.spec: check calling to subscribe on TxQueuePoint with RabbitMQ', (done) => {
    logger.info('tx-routepoint.spec: check calling to subscribe on TxQueuePoint with RabbitMQ');

    TxRoutePointRegistry.instance.setDriver(TxConnectorNoDefaultExpress);

    const RP1 = TxRoutePointRegistry.instance.route('GITHUB::API::AUTH');
    const RP2 = TxRoutePointRegistry.instance.route('GITHUB::API::READ');

    expect(RP1.name).to.equal('GITHUB::API::AUTH');
    expect(RP2.name).to.equal('GITHUB::API::READ');

    RP1.route().connect('service-a', 'tasks.component')

    RP1.route().subscribe((data) => {
      console.log("[RP1:subscribe] data = " + JSON.stringify(data, undefined, 2));
      done();
    });

    RP1.route().next('service-a', 'tasks.#', {from: 'service-a', data: 'data'});

  });

  it('tx-routepoint.spec: just exit', (done) => {
    logger.info('tx-routepoint.spec: just exit');

    done();
    setTimeout(() => {
      process.exit(0);
    }, 2000)

  });

});
