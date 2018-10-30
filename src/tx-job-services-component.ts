import createLogger from 'logging';
const logger = createLogger('TxJobServicesComponent');

import { TxQueuePointRegistry } from './tx-queuepoint-registry';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxJobRegistry } from './tx-job-resgitry';
import TxNames from './tx-names';
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
    const __method = 'TxJobServicesComponent:initMountPoint';

    // subscribe to inporcess incoming messages that need to send over the queue
    this.mountpoint.tasks().subscribe(
      async (task) => {        
        logger.info(`[${__method}:subscribe] task.head.next - ${task.head.next}`);        

        await this.queuepoint.queue().next(task.head.next, TxNames.JOB_SERVICE, task); 
    })    
  }

  async initQueuePoint() {
    const __method = 'TxJobServicesComponent:initQueuePoint';

    // subscribe to incoming messages from other services from qeueu  
    logger.info(`${__method}: register on [${TxJobRegistry.instance.getServiceName()}]=[${TxNames.JOB_SERVICE}`);

    await this.queuepoint.queue().register(TxJobRegistry.instance.getServiceName(), TxNames.JOB_SERVICE);
    await this.queuepoint.queue().subscribe(      
      async (request) => {        
        let service = JSON.parse(request);        
        logger.info(`[${__method}:subscribe] ${TxJobRegistry.instance.getServiceName()} service object = ${JSON.stringify(service['head'], undefined, 2)}`);

        let job = TxJob.create(service.data.job);

        job.getIsCompleted().subscribe(
          (task) => {
            logger.info(`[${__method}:subscribe] job('${job.getName()}') is completed task: ${JSON.stringify(task['head'], undefined, 2)}`);
            this.mountpoint.reply().next(new TxTask({status: 'completed'}, task));

          (error) => {
            logger.info(`[${__method}:isCompleted] ERROR, job(${job.getName()}) end with error: ${JSON.stringify(error, undefined, 2)}`);
          }  
        });
        logger.info(`[${__method}:subscribe] going to execute service ${service.head.next}`);        

        job.execute(service.data.task, service.data.options);
      });
  }
}
