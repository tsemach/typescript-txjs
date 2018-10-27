import { TxMountPointRegistry } from './../../../src/tx-mountpoint-registry';
// import { TxJobServicesComponent } from "../../../src/tx-job-services-component";
// import { TxJobRegistry, TxQueuePointRegistry } from "../../../src";

// TxJobRegistry.instance.setServiceName('serivce-b');

// // this client is running from other process
// export class Client {
//   private queuepoint = TxQueuePointRegistry.instance.queue('SERVICE-B::CLIENT');

//   constructor() {
//   }

//   async init() {
//     await this.queuepoint.queue().register('service-b', 'jobs.services');
//     this.queuepoint.queue().subscribe(
//       (data) => {
//         console.log("[Client:subscribe] got data = " + data);
//       }
//     );
//   }

//   async send() {
//     console.log("Client: going send to service-a");
//     await this.queuepoint.queue().next('service-a', 'jobs.services', 'from Client');
//   }

// }


// async function  client() {
//   //(new TxJobServicesComponent()).init();  
//   let q = new Client();
//   await q.init();  
  
//   await q.send();
//   // let queuepoint = TxQueuePointRegistry.instance.get('SERVICE-B::CLIENT');  

//   // queuepoint.queue().next('service-1.queuepoint', 'Q1Component.tasks', 'from Q2Component');

// }

// client();

import createLogger from 'logging';
const logger = createLogger('Q2Component');

import { TxQueuePointRegistry, TxJobRegistry, TxTask } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';
import { TxJobServicesHeadTask } from '../../../src/tx-job-services-task';

TxJobRegistry.instance.setServiceName('service-c');

// export class Client {
//   private queuepoint = TxQueuePointRegistry.instance.queue('GITHUB::API::READ');

//   constructor() {
//   }

//   async init() {
//     await this.queuepoint.queue().register('service-c', 'jobs.services');
//     this.queuepoint.queue().subscribe(
//       (data) => {
//         logger.info("[Client:subscribe] got data = " + data);
//       });
//   }

//   async send() {
//     await this.queuepoint.queue().next('service-a', 'jobs.services', 'from Client');
//   }
// }


let Q2 = new TxJobServicesComponent()
//let Q2 = new Client();

async function run() {
  await Q2.init();

  let data = {
    from: 'dummy'
  }

  let mp = TxMountPointRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');

  mp.tasks().next(new TxTask<TxJobServicesHeadTask>({next: 'service-a'}, {data}));
}

run();

