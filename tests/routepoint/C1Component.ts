import createLogger from 'logging';
const logger = createLogger('C1Component');

import { TxMountPoint } from '../../src/tx-mountpoint';
import { TxRoutePointRegistry } from '../../src/tx-routepoint-registry';

export class C1Component {
  private routepoint: TxMountPoint;
  
  constructor() {
    const config = {
      host: 'localhost',
      port: 3001,
      method: 'get',
      service: 'component',
      route: 'read'
    };
    this.routepoint = TxRoutePointRegistry.instance.create('GITHUB::C1', config);        
  }

}
