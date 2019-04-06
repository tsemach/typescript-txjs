import createLogger from 'logging'; 
const logger = createLogger('C3');

import { TxSinglePointRegistry } from 'rx-txjs';
import { TxTask } from 'rx-txjs';

export class C3Component {
  mountpoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::C3');
  method = '';

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C3Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));    
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        task.reply().next(new TxTask({method: 'from C3', status: 'ok'}, task['data']))
      },
      (error) => {
        logger.info('[C3Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        error.reply().error(new TxTask({method: 'from C3', status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[C3Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          this.mountpoint.reply().next(new TxTask({method: 'undo from C3', status: 'ok'}, task['data']))
      }
    )    
  }

}  

