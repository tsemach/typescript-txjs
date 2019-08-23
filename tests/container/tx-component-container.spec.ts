
import createLogger from 'logging';
const logger = createLogger('Component-Container-Test');

import 'mocha';
import { expect } from 'chai';

import { TxComponentContainer } from "../../src/tx-component-container";
import { Q1Component } from "./Q1Component";
import { Q2Component } from "./Q2Component";
import { TxConnectorRabbitMQ } from "../connectors/connector-rabbitmq-empty";
import { TxConnectorExpress } from "../connectors/connector-express-empty";

import { Q3Component, QMember } from "./Q3Component";
import { R3Component, RMember } from "./R3Component";
import { TxQueuePoint } from '../../src/tx-queuepoint';
import { TxTYPES } from '../../src/tx-injection-types';

const TxQueueContainer = new TxComponentContainer<TxQueuePoint>(TxQueuePoint, TxTYPES.TxQueuePoint, TxConnectorRabbitMQ);

describe('Component Container Class', () => {

  it('tx-component-container.spec: check if component container inject TxQueuePoint', () => {

    let cp;

    // prepare injector for Q1Component and Q2Component
    TxQueueContainer.setDriver(TxConnectorRabbitMQ);
    TxQueueContainer.addComponent<Q1Component>(Q1Component, 'Q1Component');
    TxQueueContainer.addComponent<Q2Component>(Q2Component, 'Q2Component');

    cp = TxQueueContainer.get('Q1Component', 'Q1COMPONENT::QUEUE::CONTAINER');
    logger.info("cp: name = " + cp.queuepoint.name.toString());``
    expect(cp.queuepoint.name.toString()).to.equal('Q1COMPONENT::QUEUE::CONTAINER');
    expect(cp.description()).to.equal('This is Q1Component');

    cp = TxQueueContainer.get('Q2Component','Q2COMPONENT::QUEUE::CONTAINER');
    logger.info("cp: name = " + cp.queuepoint.name.toString());
    expect(cp.queuepoint.name.toString()).to.equal('Q2COMPONENT::QUEUE::CONTAINER');
    expect(cp.description()).to.equal('This is Q2Component');
  });
  
});