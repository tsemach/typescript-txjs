
import { TxPublisher } from './tx-publisher';
import { TxRouteServiceConfig } from './tx-route-service-config';

export class TxPublisherREST implements TxPublisher {
  public static _instance: TxPublisherREST;

  private constructor() {
  }

  public static get instance(): TxPublisher {
    return this._instance || (this._instance = new this());
  }

  publish(name: string, config: TxRouteServiceConfig): void {
    throw new Error("Method not implemented.");
  }

  resister(name: string, config: TxRouteServiceConfig): void {
    throw new Error("Method not implemented.");
  }

}