import * as express from 'express';
import { TxRouteServiceConfig } from './tx-route-service-config';

export interface TxRouteService {
  add(config: TxRouteServiceConfig): express.Router;
}
