import createLogger from 'logging'; 
const logger = createLogger('E3');

import { TxSinglePointRegistry } from '../../../src';
import { TxTask } from '../../../src';

export class E3Component {
  private mountpoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::E3');
  method = '';

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[E3Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));    
        this.method = task['method'];

        // E3Component got error, send reply on error channel to the caller.
        task.reply().error(new TxTask({method: 'from E3', status: 'ERROR'}, task['data']))
      },
      (error: TxTask<any>) => {
        logger.info('[E3Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from E3', status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[E3Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from E3', status: 'ok'}, task['data']))
      }
    )    
  }

}  

