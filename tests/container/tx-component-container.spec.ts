
import createLogger from 'logging';
const logger = createLogger('Component-Container-Test');

import 'mocha';
import { expect } from 'chai';

import { TxQueueContainer, TxRouteContainer  } from "../../src/tx-component-container";
import { Q1Component } from "./Q1Component";
import { Q2Component } from "./Q2Component";
import { R1Component } from "./R1Component";
import { R2Component } from "./R2Component";
import { TxConnectorRabbitMQ } from "../../src/tx-connector-rabbitmq";
import { TxConnectorExpress } from "../../src/tx-connector-express";

import { Q3Component, QMember } from "./Q3Component";
import { R3Component, RMember } from "./R3Component";

describe('Component Container Class', () => {

  it('tx-component-container.spec: check if component container inject TxQueuePoint', () => {

    let cp;

    // prepare injector for Q1Component and Q2Component
    TxQueueContainer.setDriver(TxConnectorRabbitMQ);
    TxQueueContainer.addComponent<Q1Component>(Q1Component, 'Q1Component');
    TxQueueContainer.addComponent<Q2Component>(Q2Component, 'Q2Component');

    // prepare injector for R1Component and R2Component
    TxRouteContainer.setDriver(TxConnectorExpress);
    TxRouteContainer.addComponent<R1Component>(R1Component, 'R1Component');
    TxRouteContainer.addComponent<R2Component>(R2Component, 'R2Component');

    cp = TxQueueContainer.get('Q1Component', 'Q1COMPONENT::QUEUE::CONTAINER');
    logger.info("cp: name = " + cp.queuepoint.name.toString());``
    expect(cp.queuepoint.name.toString()).to.equal('Q1COMPONENT::QUEUE::CONTAINER');
    expect(cp.description()).to.equal('This is Q1Component');

    cp = TxQueueContainer.get('Q2Component','Q2COMPONENT::QUEUE::CONTAINER');
    logger.info("cp: name = " + cp.queuepoint.name.toString());
    expect(cp.queuepoint.name.toString()).to.equal('Q2COMPONENT::QUEUE::CONTAINER');
    expect(cp.description()).to.equal('This is Q2Component');

    cp = TxRouteContainer.get('R1Component', 'R1COMPONENT::QUEUE::CONTAINER');
    logger.info("cp: name = " + cp.routepoint.name.toString());
    expect(cp.routepoint.name.toString()).to.equal('R1COMPONENT::QUEUE::CONTAINER');
    expect(cp.description()).to.equal('This is R1Component');

    cp = TxRouteContainer.get('R2Component','R2COMPONENT::QUEUE::CONTAINER');
    logger.info("cp: name = " + cp.routepoint.name.toString());
    expect(cp.routepoint.name.toString()).to.equal('R2COMPONENT::QUEUE::CONTAINER');
    expect(cp.description()).to.equal('This is R2Component');
  });

  it('tx-component-container.spec: injection of TxQueuePoint and QMember into Q3Component and R3Component', () => {

    let cp;

    // prepare injector for Q3Component
    TxQueueContainer.setDriver(TxConnectorRabbitMQ);
    TxQueueContainer.addComponent<R1Component>(Q3Component, 'Q3Component');
    TxQueueContainer.addBind<QMember>(QMember, 'QMember');
    TxQueueContainer.addBindConstantValue<string>('QMember::name', 'tsemach');

    cp = TxQueueContainer.get('Q3Component', 'Q3COMPONENT::QUEUE::CONTAINER');
    logger.info("cp: name = " + cp.queuepoint.name.toString());
    logger.info("cp: qmember = " + cp.getQMemberName());
    expect(cp.queuepoint.name.toString()).to.equal('Q3COMPONENT::QUEUE::CONTAINER');
    expect(cp.description()).to.equal('This is Q3Component');
    expect(cp.getQMemberName()).to.equal('tsemach');

    // prepare injector for R3Component
    TxRouteContainer.setDriver(TxConnectorExpress);
    TxRouteContainer.addComponent<R1Component>(R3Component, 'R3Component');
    TxRouteContainer.addBind<QMember>(RMember, 'RMember');
    TxRouteContainer.addBindConstantValue<string>('RMember::name', 'tsemach');

    cp = TxRouteContainer.get('R3Component', 'R3COMPONENT::QUEUE::CONTAINER');
    logger.info("cp: name = " + cp.routepoint.name.toString());
    logger.info("cp: rmember = " + cp.getRMemberName());
    expect(cp.routepoint.name.toString()).to.equal('R3COMPONENT::QUEUE::CONTAINER');
    expect(cp.description()).to.equal('This is R3Component');
    expect(cp.getRMemberName()).to.equal('tsemach');
  });

});