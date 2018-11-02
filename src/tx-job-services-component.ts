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
     },
     async (error) => {
        let name = TxJobRegistry.instance.getServiceName();
        logger.info(`[(${name}):${__method}:subscribe] got error - ${JSON.stringify(error, undefined, 2)}`);

        //let job = TxJob.create(error.data.job);
        await this.queuepoint.queue().error(error.head.next, TxNames.JOB_SERVICE, error); 

       //job.execute(error.data.task, error.data.options);
        // logger.info(`[${__method}:isCompleted] ERROR, job = ${JSON.stringify(job.toJSON(), undefined, 2)}`);
        // logger.info(`[${__method}:isCompleted] ERROR, job(${job.getName()}) end with error: ${JSON.stringify(error, undefined, 2)}`);
     })    
  }

  async initQueuePoint() {
    const __method = 'TxJobServicesComponent:initQueuePoint';
    const __name = TxJobRegistry.instance.getServiceName();

    // subscribe to incoming messages from other services from qeueu  
    logger.info(`${__method}: register on [${TxJobRegistry.instance.getServiceName()}]=[${TxNames.JOB_SERVICE}`);

    await this.queuepoint.queue().register(TxJobRegistry.instance.getServiceName(), TxNames.JOB_SERVICE);
    await this.queuepoint.queue().subscribe(
      async (request) => {        
        let service = JSON.parse(request);        
        logger.info(`[(${__name}:${__method}):subscribe] got request from service object: ${JSON.stringify(service['head'])}`);

        this.handleQueueRequest(service);
      },
      (error) => {
        error = JSON.parse(error);
        logger.error(`[(${__name}:${__method}):subscribe] queuepoint error callback, got error from: ${JSON.stringify(error, undefined, 2)}`);

        TxJob.create(error.data.job).errorAll(error.data.task, error.data.options);
      });
  }

  // this method called from other service using S2S. 
  handleQueueRequest(request) {
    const __method = 'TxJobServicesComponent:handleQueueRequest';

    let job = TxJob.create(request.data.job);

    // // NOTE: need to remove this part
    // // add to execution option another mountpoint to notify when job is completed.
    // const jobSubscribe = job.getIsCompleted().subscribe(
    //   (task) => {
    //     logger.info(`[${__method}):subscribe] job('${job.getName()}') is completed task: ${JSON.stringify(task['head'], undefined, 2)}`);
    //     this.mountpoint.reply().next(new TxTask({status: 'completed'}, task));

    //     jobSubscribe.unsubscribe();
    //   },  
    // );
    
    logger.info(`[${__method}):subscribe] going to execute service ${request.head.next}`);        

    job.execute(request.data.task, request.data.options);
  }
}
