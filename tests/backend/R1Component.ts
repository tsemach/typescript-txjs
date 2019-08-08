import createLogger from 'logging';
const logger = createLogger('R1Component');

import { TxMountPoint } from '../../src/tx-mountpoint';
import { TxRoutePointRegistry } from '../../src/tx-routepoint-registry';
import { TxRouteServiceTask } from '../../src/tx-route-service-task';

export class R1Component {
  private mountpoint: TxMountPoint;
  private config = {
      host: 'localhost',
      port: 3100,
      method: 'get',
      service: 'sanity',
      route: 'save'
  };

  constructor() {
    // don't use create here, create is for client side, route create the internally express route
    this.mountpoint = TxRoutePointRegistry.instance.route('GITHUB::R1', this.config);

    this.mountpoint.tasks().subscribe(
    (task: TxRouteServiceTask<any>) => {
      console.log('[R1Component::subscribe] subscribe called, task:', JSON.stringify(task.get(), undefined, 2));

      task.reply().next(new TxRouteServiceTask<any>({
        headers: {
          source: 'R1Component',
          token: '123456780ABCDEF'
        },
        response: {
          status: 200,
          type: 'json'
        }},
        {
          source: 'R1Component', status: "ok"
        }
      ));      
    });

  }

}
