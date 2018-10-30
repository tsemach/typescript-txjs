import createLogger from 'logging';
const logger = createLogger('TxJobServicesComponent');

import { TxQueuePointRegistry } from './tx-queuepoint-registry';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxJobRegistry } from './tx-job-resgitry';
import { TxJob } from './tx-job';
import { TxTask } from './tx-task';

/**
 * S2S - 
 */
export class TxJobServicesComponent {
  mountpoint = TxMountPointRegistry.instance.create('JOB::SERVICES::MOUNTPOINT::COMPONENT');
  queuepoint = TxQueuePointRegistry.instance.create('JOB::SERVICES::QUEUEPOINT::COMPONENT');

  constructor() {    
  }

  async init() {
    logger.info('[TxJobServicesComponent] init is called');
    
    await this.initMountPoint();
    await this.initQueuePoint();

    return this;
  }

  initMountPoint() {   
    // subscribe to inporcess incoming messages that need to send over the queue
    this.mountpoint.tasks().subscribe(
      async (task) => {        
        logger.info('[TxJobServicesComponent] task.head.next - ', task.head.next);        

        await this.queuepoint.queue().next(task.head.next, 'job.services', task); 
    })    
  }

  async initQueuePoint() {
    // subscribe to incoming messages from other services from qeueu  
    logger.info('TxJobServicesComponent: register on [' + TxJobRegistry.instance.getServiceName() + ']=[' + 'job.services]')

    await this.queuepoint.queue().register(TxJobRegistry.instance.getServiceName(), 'job.services');
    await this.queuepoint.queue().subscribe(      
      async (request) => {        
        let service = JSON.parse(request);
        //data = data.data.data;
        console.log(`[TxJobServicesComponent:subscribe] service = ${JSON.stringify(service, undefined, 2)}`);
        let job = TxJob.create(service.data.job);

        job.getIsCompleted().subscribe(
          (task) => {
            logger.info(`[TxJobServicesComponent:subscribe] job('${job.getName()}') is completed task: ${JSON.stringify(task, undefined, 2)}`);
            this.mountpoint.reply().next(new TxTask({status: 'completed'}, task));

          (error) => {
            logger.info(`[TxJobServicesComponent:subscribe] ERROR, job(${job.getName()}) end with error: ${JSON.stringify(error, undefined, 2)}`);
          }  
        });

        job.execute(service.task, service.options);
      });
  }
}
