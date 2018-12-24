
import { TxConnectorExpress } from './../../src/tx-connector-express';
import { TxRoutePointRegistry, TxTask } from "../../src";

TxRoutePointRegistry.instance.setDriver(TxConnectorExpress);

async function run() {  
  let R2 = TxRoutePointRegistry.instance.create('ROUTE::R2')

  R2.listen('localhost:3002', '/route2');  // R2 is my host
  // subscribe to calleback from R1 (main-route-1 (remote) -> main-route-2 (me))
  R2.subscribe(
    (task) => {
      console.log('[R2:subscribe] got data from R1 (remote): task = ' + JSON.stringify(task.get(), undefined, 2))

      console.log(`[R2:subscribe] going to send to 'localhost:+${task.head.port}' on path ${task.head.path}`);    
      R2.next('localhost:'+task.head.port, task.head.path, new TxTask<any>({port: '3002', path: 'route2'}, 'send from  main-rotue-2 (me) to main-route-1'))

      R2.close();      
    });    

}

run();

