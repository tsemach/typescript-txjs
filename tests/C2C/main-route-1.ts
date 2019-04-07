
// import { TxConnectorExpress } from './../../src/tx-connector-express';
// import { TxRoutePointRegistry, TxTask } from "../../src";

// TxRoutePointRegistry.instance.setDriver(TxConnectorExpress);

// async function run() {  
//   let R1 = TxRoutePointRegistry.instance.create('ROUTE::R1')

//   R1.listen('localhost:3001', '/route1');  // R2 is my host
//   // subscribe to calleback from R1 (remote -> localhost)
//   R1.subscribe(
//     (task) => {
//       console.log('[R2:subscribe] got data from R2 (remote): task = ' + JSON.stringify(task.get(), undefined, 2))
      
//       R1.close();      
//     });    

//   R1.next('localhost:3002', 'route2', new TxTask<any>({port: '3001', path: 'route1'}, 'send to main-rotue-2 (remote) server R2'))
// }

// run();

