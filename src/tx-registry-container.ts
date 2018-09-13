
import { Container } from "inversify";
import { TxTYPES } from "./tx-injection-types";
import { TxConnector } from "./tx-connector";

/**
 * a wrapper class for inversify container to keep driver bind.
 */
export class TxRegistryContainer<T> {
  // a container for TxConnector injection
  txContainer = new Container();
  bind: any;

  // set the bind to himself.
  constructor(type, bind) {
    this.txContainer.bind<T>(bind).to(type);

    this.bind = bind;
  }

  get(name) {
    if (this.txContainer.isBound(TxTYPES.TxPointName)) {
      this.txContainer.unbind(TxTYPES.TxPointName);
    }
    this.txContainer.bind<string | Symbol>(TxTYPES.TxPointName).toConstantValue(name);

    return this.txContainer.get<T>(this.bind);
  }

  setDriver(type) {
    if ( this.txContainer.isBound(TxTYPES.TxConnector)) {
      this.txContainer.unbind(TxTYPES.TxConnector);
    }
    this.txContainer.bind<TxConnector>(TxTYPES.TxConnector).to(type);
  }
}
