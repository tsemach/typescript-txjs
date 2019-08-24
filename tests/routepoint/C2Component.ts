import createLogger from 'logging';
const logger = createLogger('C2Component');

import { TxRoutePointRegistry } from '../../src/tx-routepoint-registry';

export class C2Component {
  
  constructor() {
    const config = {
      host: 'localhost',
      port: 3001,
      method: 'get',
      service: 'component',
      route: 'read'
    };
    TxRoutePointRegistry.instance.create('GITHUB::C2', config);
  }

}
