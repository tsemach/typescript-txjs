import createLogger from 'logging';
const logger = createLogger('R1Component');

import { TxRoutePointRegistry } from '../../../src/tx-routepoint-registry';

export class R1Component {
  
  constructor() {
    const config = {
      host: 'localhost',
      port: 3001,
      method: 'get',
      service: 'component',
      route: 'read'
    };
    TxRoutePointRegistry.instance.create('GITHUB::R1', config);
  }

}
