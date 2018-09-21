import createLogger from 'logging'; 
const logger = createLogger('E3');

import { TxMountPointRegistry } from '../../src';
import { TxTask } from '../../src';

export class E3Component {
  private mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::E3');
  method = '';

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[E3Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));    
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        //this.mountpoint.reply().next(new TxTask({method: 'from E3', status: 'ok'}, task['data']))

        // E#Component got error, send reply on error channel to the caller.
        this.mountpoint.reply().error(new TxTask({method: 'from E3', status: 'ERROR'}, task['data']))
      },
      (error) => {
        logger.info('[E3Component:error] got error = ' + JSON.stringify(error, undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().error(new TxTask({method: 'from E3', status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[E3Component:undo] undo got task = ' + JSON.stringify(task, undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          this.mountpoint.reply().next(new TxTask({method: 'undo from E3', status: 'ok'}, task['data']))
      }
    )    
  }

}  

