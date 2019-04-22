import createLogger from 'logging'; 
const logger = createLogger('JobRunner');

import { TxJobExecutionOptions, defaultExecutionOptions } from "./tx-job-execution-options";
import { TxSubscribe } from './tx-subscribe';
import { TxJob } from './tx-job';
import { TxTask } from './tx-task';

class TxJobRunner {

  constructor() {
  }

  execute(job: TxJob, task: TxTask<any>, isCompleted: TxSubscribe<TxJob>, options: TxJobExecutionOptions = defaultExecutionOptions) {

    job.getIsCompleted().subscribe(
      (task, from) => {
        logger.info('job - [' + from.getName() + '] completed');

        isCompleted.next(task);
    })    

    job.execute(task, options);
  }

}

export default new TxJobRunner();