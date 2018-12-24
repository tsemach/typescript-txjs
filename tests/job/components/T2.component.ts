import createLogger from 'logging'; 
const logger = createLogger('T2');

import { TxSinglePointRegistry } from '../../../src/tx-singlepoint-registry';
import { TxTask } from '../../../src/tx-task';

export class T2Component {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::T2');

  method = '';
  reply: any;

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task) => {
        logger.info('[T2Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        //setTimeout(() => {
            logger.info('[T2Component:tasks] complete run its task after 1000 miliseconds, going to next');

            task.reply().next(new TxTask({method: 'from T2', status: 'ok'}, task['data']))
        //  }, 1000);
      },
      (error) => {
        logger.info('[T2Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from T2', status: 'ERROR'}, error['data']))
      }
    );

    this.singlepoint.undos().subscribe(
      (task) => {
          logger.info('[T2Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from T2', status: 'ok'}, task['data']))
      }
    );

  }

}  