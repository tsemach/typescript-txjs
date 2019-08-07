
import {Container, inject, injectable} from "inversify";
import "reflect-metadata";

import {TxTYPES} from "./tx-injection-types";
import {TxConnector} from "./tx-connector";
import {TxQueuePoint} from "./tx-queuepoint";
import {TxRoutePoint} from "./tx-routepoint";
//import {TxConnectorRabbitMQ} from "./tx-connector-rabbitmq";
//import {TxConnectorExpress} from "./tx-connector-express";

export class TxComponentContainer<T> {
  // a container for TxConnector injection
  txContainer = new Container();

  // set the bind to himself and set driver binding.
  constructor(type, bind, driver) {
    this.txContainer.bind<T>(bind).to(type);
    this.txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(driver);
  }

  /**
   * Create the component by inject all its dependencies.
   *
   * @param bind - type value of the component
   * @param name - the name of TxQueuePoint | TxRoutePoint members.
   * @returns - instance of the component.
   */
  get(bind, name) {
    if (this.txContainer.isBound(TxTYPES.TxPointName)) {
      this.txContainer.unbind(TxTYPES.TxPointName);
    }
    this.txContainer.bind<string | Symbol>(TxTYPES.TxPointName).toConstantValue(name);

    return this.txContainer.get(bind);
  }

  /**
   * A component that need be injected TxQueuePoint or TxRoutePoint member class
   *
   * @param type - type value of a component
   * @param bind - the bind name, something like TxTYPES.xxx
   */
  addComponent<T>(type, bind) {
    this.txContainer.bind<T>(bind).to(type);
  }

  /**
   * Add any other bind member of component class. If a component include other member use this
   * method to their binding.
   *
   * @param type - type value of member of a component
   * @param bind - its binding name
   */
  addBind<B>(type, bind) {
    this.txContainer.bind<B>(bind).to(type);
  }

  addBindConstantValue<B>(bind, value) {
    this.txContainer.bind<B>(bind).toConstantValue(value);
  }

  /**
   * set the driver type that needed to inject into TxQueuePoint or TxRoutePoint member of
   * a component.
   *
   * @param driver - type value of a driver class needed to inject into TxQueuePoint or TxRoutePoint.
   * the TxQueuePoint or TxRoutePoint are member of the component.
   */
  setDriver(driver) {
    if (this.txContainer.isBound(TxTYPES.TxConnector)) {
      this.txContainer.unbind(TxTYPES.TxConnector);
    }
    this.txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(driver);
  }
}

