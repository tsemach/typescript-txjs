import createLogger from 'logging'; 
const logger = createLogger('E1');

import { TxSinglePointRegistry } from '../../../src';
import { TxTask } from '../../../src';

export class E1Component {
  private mountpoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::E1');

  method = '';
  reply: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[E1Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          
        this.method = task['method'];

        if (task.getHead().status === 'forward') {
          task.reply().error(new TxTask({method: 'from E1', status: 'ERROR'}, task['data']))

          return;
        }

        // just send the reply to whom is 'setting' on this reply subject
        task.reply().next(new TxTask({method: 'from E1', status: 'ok'}, task['data']))
      },
      (error: TxTask<any>) => {
        logger.info('[E1Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from E1', status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task: TxTask<any>) => {
          logger.info('[E1Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from E1', status: 'ok'}, task['data']))
      }
    );

  }

  getReply() {
    return JSON.stringify(this.reply);
  }

}  