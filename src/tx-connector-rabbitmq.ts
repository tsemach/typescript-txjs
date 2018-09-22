import { injectable, inject } from "inversify";
import "reflect-metadata";
import * as uuid from 'uuid/v4';
import { Broker } from 'typescript-rabbitmq';
import { BrokerExchangeOptions, BrokerQueueOptions } from 'typescript-rabbitmq';

/**
 * C2C - part of component-2-component communication
 * use as TxConnector implementation class for RabbitMQ.
 */
import { TxConnector } from "./tx-connector"

let config: any = {
  connection: {
    user: process.env.QUEUE_USERNAME || 'guest',
    pass: process.env.QUEUE_PASSWORD || 'guest',
    host: process.env.QUEUE_SERVER || 'localhost',
    port: process.env.QUEUE_PORT || '5672',
    timeout: 2000,
    name: "rabbitmq"
  },
  exchanges: [
  ],
  queues: [
  ],
  binding: [
  ],
  logging: {
    adapters: {
      stdOut: {
        level: 3,
        bailIfDebug: true
      }
    }
  }
};

@injectable()
export class TxConnectorRabbitMQ implements TxConnector {
  subscribeBC: (any) => void;

  broker = new Broker(config);
  id = uuid();

  constructor() {
  }

  async register(service: any, route: any) {
    console.log(`TxConnectorRabbit:connect - enter to - [${service}]-[${route}]-[${this.id}]`);

    await this.broker.connect();

    await this.broker.addExchange(service + '.exchange', 'topic', {publishTimeout: 1000, persistent: true, durable: false} as BrokerExchangeOptions);
    await this.broker.addQueue(service + '.queue', {limit: 1000, queueLimit: 1000} as BrokerQueueOptions);
    await this.broker.addBinding(service + '.exchange', service + '.queue', route);
    await this.broker.addConsume(service + '.queue', this.queueCB.bind(this), false);

    console.log(`TxConnectorRabbit:connect - exist from - [${service}]-[${route}]-[${this.id}]`);
  }

  subscribe(cb: (any) => void) {
    this.subscribeBC = cb;
  };

  async next(service, route, data: any) {
    await this.broker.addExchange(service + '.exchange', 'topic', {publishTimeout: 1000, persistent: true, durable: false} as BrokerExchangeOptions);
    await this.broker.send(service + '.exchange', route, data);
  }

  queueCB(data) {
    this.subscribeBC(data.content.toString());
  }

  close() {
    this.broker.close();
  }
}
