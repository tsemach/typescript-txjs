import createLogger from 'logging';
const logger = createLogger('R1Component');

import { TxRoutePoint, TxTask } from '../../src';
import { TxRoutePointRegistry } from '../../src/tx-routepoint-registry';

export class R1Component {
  private routepoint: TxRoutePoint;
  
  constructor() {
    this.routepoint = TxRoutePointRegistry.instance.create('GITHUB::R1')    
    
    this.routepoint.listen('localhost:3001', '/test1').subscribe(
      (task) => {
        logger.info('[subscribe] got data from service: task = ' + JSON.stringify(task.get(), undefined, 2))        

        let host = 'localhost:'+task.head.port
        let path = task.head.path

        console.log(`R1Component:subscribe going to send to ${host} path ${path}`)

        this.routepoint.next(host, path, new TxTask<any>({from: 'localhost:3001:/test2'}, 'this is the data send from remote server R1 to localhost'))
        this.routepoint.close()
      }
    )
  }

}
