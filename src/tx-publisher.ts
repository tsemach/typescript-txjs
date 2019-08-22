
import { TxRouteServiceConfig } from './tx-route-service-config';
import { TxRoutpointIndicator } from './tx-routepint-indicator';

export interface TxPublisher {
  publish(name: string, config: TxRouteServiceConfig): void;
  discover(name: string | Symbol): Promise<TxRoutpointIndicator>;
}
