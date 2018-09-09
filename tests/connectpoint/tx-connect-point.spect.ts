
//import logger = require('logging');
import createLogger from 'logging';
const logger = createLogger('ConnectPoint-Test');

import 'mocha';
import { expect } from 'chai';

import {Container, injectable, inject} from "inversify";
import "reflect-metadata";
import * as uuid from 'uuid/v4';

import { TxTYPES } from "../../src/tx-injection-types";
import { TxConnector } from "../../src/tx-connector";
import { TxConnectPoint } from "../../src/tx-connect-point";

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

  next(any: any) {
    this.subscribeBC(any);
    console.log("next: TxConnectorRabbit Method not implemented.");
  }
}

describe('Connect Point Class', () => {

  it('mountpoint.spec: send task from gist-get-filename to gist-get-raw-url', () => {


    const txContainer = new Container();
    txContainer.bind<TxConnectPoint>(TxTYPES.TxConnectPoint).to(TxConnectPoint);
    txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(TxConnectorRabbitMQ);

    const CP1 = txContainer.get<TxConnectPoint>(TxTYPES.TxConnectPoint);
    const CP2 = txContainer.get<TxConnectPoint>(TxTYPES.TxConnectPoint);

    CP1.tasks().connect('CP1', 'tasks:connect');
    CP1.reply().connect('CP1', 'reply:connect');
    CP1.undos().connect('CP1', 'undos:connect');

    CP2.tasks().connect('CP2', 'tasks:connect');
    CP2.reply().connect('CP2', 'reply:connect');
    CP2.undos().connect('CP2', 'undos:connect');

    //expect(mountpoint.name).to.equal('Symbol(GITHUB::GIST::C1)');

  });

});