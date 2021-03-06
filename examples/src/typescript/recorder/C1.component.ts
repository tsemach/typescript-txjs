import createLogger from 'logging'; 
const logger = createLogger('C1');

import { TxMountPointRegistry } from 'rx-txjs';
import { TxTask } from 'rx-txjs';

export class C1Component {
  private mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C1');

  method = '';
  reply: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C1Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask({method: 'from C1', status: 'ok'}, task['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[C1Component:undo] undo got task = ' + JSON.stringify(task, undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          this.mountpoint.reply().next(new TxTask({method: 'undo from C1', status: 'ok'}, task['data']))
      }
    );

  }

  getReply() {
    return JSON.stringify(this.reply);
  }

}  