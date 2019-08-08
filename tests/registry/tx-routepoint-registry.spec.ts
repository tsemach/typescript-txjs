
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
  
// TxRoutePointRegistry.instance.setDriver(TxConnectorNoDefaultExpress);

describe('Registry Classes - TxRoutePointRegitry', () => {

  it('tx-routepoint.spec: check creation of TxRoutePoint with default TxConnectorExpress connector injection', async () => {
    logger.info('tx-routepoint.spec: check creation of TxRoutePoint with default TxConnectorExpress connector injection');

    const RP1 = TxRoutePointRegistry.instance.route('GITHUB::API::AUTH');
    const RP2 = TxRoutePointRegistry.instance.route('GITHUB::API::READ');

    expect(RP1.name).to.equal('GITHUB::API::AUTH');
    expect(RP2.name).to.equal('GITHUB::API::READ');

    // await RP1.listen('localhost:3001', 'listen1');
    // await RP2.listen('localhost:3002', 'listen2');

    // let set = new Set<string>();
    // set.add(RP1.id);
    // set.add(RP2.id);

    // // make sure they all the same UUIDs, because the connector is singleton.
    // expect(set.size).to.equal(2);

    // // make sure they all valid UUID
    // assert(isUUID(RP1.id));
    // assert(isUUID(RP2.id));    
  });

  it('tx-routepoint.spec: check creation of TxRoutePoint with Express connector injection', () => {
    logger.info('tx-routepoint.spec: check creation of TxRoutePoint with Express connector injection');

    const RP1 = TxRoutePointRegistry.instance.route('GITHUB::API::AUTH');
    const RP2 = TxRoutePointRegistry.instance.route('GITHUB::API::READ');

    expect(RP1.name).to.equal('GITHUB::API::AUTH');
    expect(RP2.name).to.equal('GITHUB::API::READ');

    // RP1.listen('CP1:3000', 'listen');
    // RP2.listen('CP2:3001', 'POST:listen');

    // let set = new Set<string>();
    // set.add(RP1.id);
    // set.add(RP2.id);

    // // make sure they all the same UUIDs, because the connector is singleton.
    // expect(set.size).to.equal(2);

    // // make sure they all valid UUID
    // assert(isUUID(RP1.id));
    // assert(isUUID(RP2.id));
  });

});
