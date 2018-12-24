import createLogger from 'logging'; 
const logger = createLogger('T1');

import { TxSinglePointRegistry } from '../../../src/tx-singlepoint-registry';
import { TxTask } from '../../../src/tx-task';

export class T1Component {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::T1');

  method = '';
  reply: any;

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task) => {
        logger.info('[T1Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        //setTimeout(() => {
            logger.info('[T1Component:tasks] complete run its task after 2000 miliseconds, going to next');

            task.reply().next(new TxTask({method: 'from T1', status: 'ok'}, task['data']))
        //  }, 2000);
      },
      (error) => {
        logger.info('[T1Component:error] got error = ' + JSON.stringify(error, undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from T1', status: 'ERROR'}, error['data']))
      }
    );

    this.singlepoint.undos().subscribe(
      (task) => {
          logger.info('[T1Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from T1', status: 'ok'}, task['data']))
      }
    );

  }

}  