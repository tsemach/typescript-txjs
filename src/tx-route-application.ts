import { TxRouteService } from "./tx-route-service";
import { TxRouteServiceConfig } from "./tx-route-service-config";

export interface TxRouteApplication {
  register(where: string, service: TxRouteService, config: TxRouteServiceConfig): void;
}