import createLogger from 'logging'; 
const logger = createLogger('S5');

import { TxTask } from '../../../src/tx-task';
import { TxSinglePointRegistry } from '../../../src/tx-singlepoint-registry';

export class S5Component {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::S5');

  method = '';
  reply: any;

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[S5Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        task.reply().next(new TxTask({method: 'from S5', status: 'ok'}, task['data']))
      },
      (error: TxTask<any>) => {
        logger.info('[S5Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from S5', status: 'ERROR'}, error['data']))
      }
    );

    this.singlepoint.undos().subscribe(
      (task: TxTask<any>) => {
          logger.info('[S5Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from S5', status: 'ok'}, task['data']))
      }
    );

  }

  getReply() {
    return JSON.stringify(this.reply);
  }

}  