import createLogger from 'logging';
const logger = createLogger('S1Component');

import { TxMountPoint } from '../../src/tx-mountpoint';
import { TxRoutePointRegistry } from '../../src/tx-routepoint-registry';
import { TxRouteServiceTask } from '../../src/tx-route-service-task';

export class S1Component {
  private routepoint: TxMountPoint;
  
  constructor() {
    const config = {
      host: 'localhost',
      port: 3001,
      method: 'get',
      service: 'component',
      route: 'read'
    };
    this.routepoint = TxRoutePointRegistry.instance.route('GITHUB::S2', config);
    
    this.routepoint.tasks().subscribe(
    (task: TxRouteServiceTask<any>) => {
      logger.info('[S1Component::subscribe] got data from service: task = ' + JSON.stringify(task.get(), undefined, 2))        
      
      task.reply().next(new TxRouteServiceTask<any>({
        headers: {
          source: 'S1Component-server',
          token: 'FEDCBA0987654321'
        },
        response: {
          status: 200,
          type: 'json'
        }},
        {
          source: 'S1Component', status: "ok",
          originData: task.get()
        } 
      ));      
    });
  }

}
