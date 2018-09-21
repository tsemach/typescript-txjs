import createLogger from 'logging'; 
const logger = createLogger('E1');

import { TxMountPointRegistry } from '../../src';
import { TxTask } from '../../src';

export class E1Component {
  private mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::E1');

  method = '';
  reply: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[E1Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask({method: 'from E1', status: 'ok'}, task['data']))
      },
      (error) => {
        logger.info('[E1Component:error] got error = ' + JSON.stringify(error, undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().error(new TxTask({method: 'from E1', status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[E1Component:undo] undo got task = ' + JSON.stringify(task, undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          this.mountpoint.reply().next(new TxTask({method: 'undo from E1', status: 'ok'}, task['data']))
      }
    );

  }

  getReply() {
    return JSON.stringify(this.reply);
  }

}  