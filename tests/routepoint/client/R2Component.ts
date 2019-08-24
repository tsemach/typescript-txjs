import createLogger from 'logging';
const logger = createLogger('R2Component');

import { TxRoutePointRegistry } from '../../../src/tx-routepoint-registry';

export class R2Component {
  
  constructor() {
    const config = {
      host: 'localhost',
      port: 3001,
      method: 'get',
      service: 'component',
      route: 'read'
    };
    TxRoutePointRegistry.instance.create('GITHUB::R2', config);
  }

}
