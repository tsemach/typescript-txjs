
//import logger = require('logging');
import createLogger from 'logging';
const logger = createLogger('MountPoint-Test');

import 'mocha';
import { expect } from 'chai';

import { TxQueueContainer, TxRouteContainer  } from "../../src/tx-component-container";
import { Q1Component } from "./Q1Component";
import { Q2Component } from "./Q2Component";
import { R1Component } from "./R1Component";
import { R2Component } from "./R2Component";
import { TxConnectorRabbitMQ } from "../../src/tx-connector-rabbitmq";

describe('Component Container Class', () => {

  it('tx-component-container.spec: check if component container inject TxQueuePoint', () => {

    let qp;
    let rp;

    TxQueueContainer.setDriver(TxConnectorRabbitMQ);
    TxQueueContainer.addComponent<Q1Component>(Q1Component, 'Q1Component');
    TxQueueContainer.addComponent<Q2Component>(Q2Component, 'Q2Component');

    qp = TxQueueContainer.get('Q1Component', 'GITHUB:READ-2');
    console.log("name = " + qp.queuepoint.name.toString());
    qp.print();

    qp = TxQueueContainer.get('Q2Component','GITHUB:READ-2-Q2');
    console.log("name = " + qp.queuepoint.name.toString());

    qp.print();

    TxRouteContainer .setDriver(TxConnectorRabbitMQ);
    TxRouteContainer .addComponent<R1Component>(R1Component, 'R1Component');
    TxRouteContainer .addComponent<R2Component>(R2Component, 'R2Component');

    rp = TxRouteContainer .get('R1Component', 'GITHUB:READ-ROUTE-R1');
    console.log("name = " + qp.queuepoint.name.toString());
    rp.print();

    rp = TxRouteContainer .get('R2Component','GITHUB:READ-ROUTE-2-R2');
    console.log("name = " + qp.queuepoint.name.toString());

    rp.print();

  });

  it('tx-mountpoint.spec: check mountpoint name as string | symbol', () => {

  });

});