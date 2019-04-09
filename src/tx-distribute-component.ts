import createLogger from 'logging';
const logger = createLogger('TxDistributeComponent');

import { TxJob } from './tx-job';
import TxNames from './tx-names';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxTask } from './tx-task';
import { TxDistributeComponentHead } from './tx-distribute-component-head';

/**
 * TxDistributeComponent - 
 */
export class TxDistributeComponent {
  private mp = TxMountPointRegistry.instance.create(TxNames.RX_TXJS_DISTRIBUTE_COMPONENT);

  constructor() {     
    this.mp.tasks().method('run', this);
  }

  run(task: TxTask<TxDistributeComponentHead>) {        
    logger.info(`${this.perfix('run')} got distribute of type: '${task.head.type}', id '${task.data.from.name}/${task.data.from.uuid}'`);

    if (task.head.type === 'job') {
      const job = (new TxJob('temp')).upJSON(task.data.from)

      console.log("CCCCCCCCCCCC task: ", JSON.stringify(task, undefined, 2))

      job.continue(new TxTask<any>(task.data.task.head, task.data.task.data), task.data.options);
    }
  }

  private perfix(method: string) {
    return `[TxDistributeComponent::${method}]`
  }
}
