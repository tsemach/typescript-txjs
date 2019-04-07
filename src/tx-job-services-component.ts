import createLogger from 'logging';
const logger = createLogger('TxJobServicesComponent');

import { TxQueuePointRegistry } from './tx-queuepoint-registry';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxRoutePointRegistry } from './tx-routepoint-registry';
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
  routepoint = TxRoutePointRegistry.instance.create('JOB::SERVICES::ROUTEPOINT::COMPONENT');

  constructor() {    
  }

  async init() {
    logger.info('[TxJobServicesComponent] init is called');
    
    await this.initMountPoint();
    await this.initQueuePoint();
    await this.initRoutePoint();

    return this;
  }

  initMountPoint() {   
    const __method = 'TxJobServicesComponent:initMountPoint';

    // subscribe to inporcess incoming messages that need to send over the queue
    this.mountpoint.tasks().subscribe(
      async (task) => {        
        logger.info(`[${__method}:subscribe] task.head.next - ${task.head.next}`);        

        // call to next service using queue to run its job
        await this.queuepoint.queue().next(task.head.next, TxNames.JOB_SERVICE, task); 
     },
     async (error) => {
        let __name = TxJobRegistry.instance.getServiceName();
        logger.info(`[(${__name}):${__method}:subscribe] got error - ${JSON.stringify(error, undefined, 2)}`);

        // notify next service that need to run error handling sequence.
        await this.queuepoint.queue().error(error.head.next, TxNames.JOB_SERVICE, error);
     })
  }

  async initQueuePoint() {
    const __method = 'TxJobServicesComponent:initQueuePoint';
    const __name = TxJobRegistry.instance.getServiceName();

    // subscribe to incoming messages from other services from qeueu
    logger.info(`[(${__name}):${__method}] register on [${TxJobRegistry.instance.getServiceName()}]=[${TxNames.JOB_SERVICE}`);

    await this.queuepoint.queue().listen(TxJobRegistry.instance.getServiceName(), TxNames.JOB_SERVICE);
    await this.queuepoint.queue().subscribe(
      async (request) => {
        let service = request;
        
        if (typeof request === 'string') {
          service = JSON.parse(request);
        }

        logger.info(`[(${__name}):${__method}:subscribe] got request from service object: ${JSON.stringify(service, undefined, 2)}`);
        logger.info(`[(${__name}):${__method}:subscribe] got request from service object: ${JSON.stringify(service['head'])}`);
        logger.info(`[(${__name}):${__method}:subscribe] going to execute service ${service.head.next}`);

        TxJob.create(service.data.job).execute(new TxTask(service.data.task.head, service.data.task.data), service.data.options);
      },
      (error) => {
        error = JSON.parse(error);
        logger.info(`[(${__name}):${__method}:subscribe] queuepoint error callback, got error from: ${JSON.stringify(error, undefined, 2)}`);
        
        TxJob.create(error.data.job).errorAll(new TxTask(error.data.task.head, error.data.task.data), error.data.options);
      });
  }

  async initRoutePoint() {
    const __name = TxJobRegistry.instance.getServiceName();
    const __method = 'TxJobServicesComponent:initRoutePoint';
    const __connection = TxJobRegistry.instance.getRouteConnection();
    const __service = __connection.service;

    if ( ! __connection.isInit() ) {
      logger.info(`[${__name}:${__method}] S2S rotue is not initialize`);

      return 
    }

    // subscribe to incoming messages from other services from route
    logger.info(`[(${__service}):${__method}] S2S rotue is on [${__service}:${__connection.port}`);

    this.routepoint.listen(__connection.service, __connection.path);
    this.routepoint.subscribe(
      (request) => {        
        logger.info(`[(${__name}):${__method}:subscribe] got request from service object: ${JSON.stringify(request, undefined, 2)}`);        
        //TxJob.create(service.data.job).execute(new TxTask(service.data.task.head, service.data.task.data), service.data.options);
      },
      (error) => {        
        logger.info(`[(${__name}):${__method}:subscribe] queuepoint error callback, got error from: ${JSON.stringify(error, undefined, 2)}`);        
        //TxJob.create(error.data.job).errorAll(new TxTask(error.data.task.head, error.data.task.data), error.data.options);
      });      
  }
}
