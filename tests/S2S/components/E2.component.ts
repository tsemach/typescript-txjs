
import createLogger from 'logging'; 
const logger = createLogger('E2Component');

import { TxSinglePointRegistry } from '../../../src/tx-singlepoint-registry';
import { TxTask } from '../../../src/index';

export class E2Component {
  private mountpoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::E2');
  method = '';

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[E2Component:task] got task = ' + JSON.stringify(task.get(), undefined, 2));
        this.method = task['method'];
        
        // just send the reply to whom is 'setting' on this reply subject
        task.reply().error(new TxTask({method: 'from E2', status: 'ERROR'}, task['data']))
      },
      (error) => {
        logger.info('[E2Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from E2', status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[E2Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          this.mountpoint.reply().next(new TxTask({method: 'undo from E2', status: 'ok'}, task['data']))
      }
    )
  }

}  
