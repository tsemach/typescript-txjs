import createLogger from 'logging'; 
const logger = createLogger('S1');

import { TxTask } from '../../src/tx-task';
import { TxSinglePointRegistry } from '../../src';

export class S1Component {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::S1');

  method = '';
  reply: any;

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task) => {
        logger.info('[S1Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject        
        task.reply().next(new TxTask({method: 'from S1', status: 'ok'}, task['data']))
      },
      (error) => {
        logger.info('[S1Component:error] got error = ' + JSON.stringify(error, undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from S1', status: 'ERROR'}, error['data']))
      }
    );

    this.singlepoint.undos().subscribe(
      (task) => {
          logger.info('[S1Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from S1', status: 'ok'}, task['data']))
      }
    );

  }

  getReply() {
    return JSON.stringify(this.reply);
  }

}  