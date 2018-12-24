import createLogger from 'logging'; 
const logger = createLogger('T2');

import { TxSinglePointRegistry } from '../../../src/tx-singlepoint-registry';
import { TxTask } from '../../../src/tx-task';

export class T2Component {
  singlepoint = TxSinglePointRegistry.instance.create('JOB::T2');

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task) => {
        logger.info('[T2Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          

        setTimeout(() => {
          logger.info(`[T2Component:tasks] complete run its task after ${task.head.timeout} miliseconds, going to next`);

          task.reply().next(new TxTask({method: 'from T2', status: 'ok', source: task.head.source}, task['data']))
        }, +task.head.timeout);

      },
      (error) => {
        logger.info('[T2Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from T2', status: 'ERROR'}, error['data']))
      }
    );

    this.singlepoint.undos().subscribe(
      (task) => {
          logger.info('[T2Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from T2', status: 'ok'}, task['data']))
      }
    );

  }

}  