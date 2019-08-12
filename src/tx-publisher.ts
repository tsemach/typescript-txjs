
import { TxRouteServiceConfig } from './tx-route-service-config';

export interface TxPublisher {
  publish(name: string, config: TxRouteServiceConfig): void;
}
