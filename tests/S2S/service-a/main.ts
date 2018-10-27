import createLogger from 'logging';
const logger = createLogger('Service-A:Main');

import { TxQueuePointRegistry, TxMountPointRegistry, TxJobRegistry } from '../../../src/';
import { TxJobServicesComponent } from '../../../src/tx-job-services-component';

TxJobRegistry.instance.setServiceName('service-a');

// export class Q1Component {
//   private mountpoint = TxMountPointRegistry.instance.create('JOB::SERVICES::MOUNTPOINT::COMPONENT');
//   private queuepoint = TxQueuePointRegistry.instance.create('JOB::SERVICES::QUEUEPOINT::COMPONENT');

//   constructor() {
//   }

//   async init() {
//     this.mountpoint.tasks().subscribe(
//       async (task) => {
//         logger.info('[TxJobServicesComponent] mountpoint: got task - ', JSON.stringify(task, undefined, 2));
//         logger.info('[TxJobServicesComponent] task.head.next - ', task.head.next);

//         await this.queuepoint.queue().next(task.head.next, 'job.services', task); 
//     })

//     console.log("Q1Component: TxJobRegistry.instance.getServiceName() = ", TxJobRegistry.instance.getServiceName());

//     await this.queuepoint.queue().register(TxJobRegistry.instance.getServiceName(), 'jobs.services');
//     await this.queuepoint.queue().subscribe(
//       async (data) => {
        
//         logger.info("[Q1Component:subscribe] got data = " + data);

//         //await this.queuepoint.queue().next('service-c', 'jobs.services', {from: 'example-1.queuepoint', data: 'data'});
//       });

//     return this;
//   }
// }


//let Q1 = new Q1Component();

async function run() {
  let Q1 = await new TxJobServicesComponent().init();  
}

run();


