// import createLogger from 'logging';
// const logger = createLogger('Q2Component');

// import { TxQueuePointRegistry } from '../../src/';

// export class Q2Component {
//   private queuepoint = TxQueuePointRegistry.instance.queue('GITHUB::API::READ');

//   constructor() {
//   }

//   async init() {
//     await this.queuepoint.queue().listen('example-2.queuepoint', 'Q2Component.tasks');
//     this.queuepoint.queue().subscribe(
//       (data) => {
//         logger.info("[Q2Component:subscribe] got data = " + data);
//       });
//   }

//   async send() {
//     await this.queuepoint.queue().next('example-1.queuepoint', 'Q1Component.tasks', 'from Q2Component');
//   }
// }
