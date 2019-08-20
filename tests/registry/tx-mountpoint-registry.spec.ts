
import createLogger from 'logging';
const logger = createLogger('MountPoint-Registry-Test');

import * as short from 'short-uuid';
const translator = short();

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';
import * as uuid from 'uuid/v4';

import {injectable} from "inversify";
import "reflect-metadata";

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxConnector } from "../../src/";

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
    console.log("error: TxConnectorNoDefaultRabbitMQ Method not implemented.");
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

  it('tx-mountpoint-registry.spec: check TxJobRegistry', () => {
   

  });

  // it('tx-mountpoint.spec: check creation of TxQueuePoint with default RabbitMQ connector injection', async () => {
  //   logger.info('tx-mountpoint.spec: check creation of TxQueuePoint with default RabbitMQ connector injection');
  //
  //   const QP1 = TxQueuePointRegistry.instance.queue('GITHUB::API::AUTH');
  //   const QP2 = TxQueuePointRegistry.instance.queue('GITHUB::API::READ');
  //
  //   expect(QP1.name).to.equal('GITHUB::API::AUTH');
  //   expect(QP2.name).to.equal('GITHUB::API::READ');
  //
  //   await QP1.queue().connect('CP1', 'tasks:connect');
  //   await QP2.queue().connect('CP2', 'tasks:connect');
  //
  //   let set = new Set<string>();
  //   set.add((<TxConnectorRabbitMQ>QP1.queue()).id);
  //   set.add((<TxConnectorRabbitMQ>QP2.queue()).id);
  //
  //   // make sure they all different UUIDs.
  //   expect(set.size).to.equal(2);
  //
  //   // make sure they all valid UUID
  //   assert(isUUID((<TxConnectorRabbitMQ>QP1.queue()).id));
  //   assert(isUUID((<TxConnectorRabbitMQ>QP2.queue()).id));
  //
  //   QP1.queue().close();
  //   QP2.queue().close();
  // });

});
