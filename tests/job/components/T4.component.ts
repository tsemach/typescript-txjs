import createLogger from 'logging'; 
const logger = createLogger('T4');

import { TxSinglePointRegistry } from '../../../src/tx-singlepoint-registry';
import { TxTask } from '../../../src/tx-task';

export class T4Component {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::T4');

  method = '';
  reply: any;

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task) => {
        logger.info('[T4Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        task.reply().next(new TxTask({method: 'from T4', status: 'ok'}, task['data']))
      },
      (error) => {
        logger.info('[T4Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from T4', status: 'ERROR'}, error['data']))
      }
    );

    this.singlepoint.undos().subscribe(
      (task) => {
          logger.info('[T4Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from T4', status: 'ok'}, task['data']))
      }
    );

  }

}  