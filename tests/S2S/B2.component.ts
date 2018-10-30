import createLogger from 'logging'; 
const logger = createLogger('B2Component');

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxMountPoint } from '../../src/tx-mountpoint';
import { TxTask } from '../../src/tx-task';

export class B2Component {
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::B2');

  method = '';
  reply: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[B2Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask({method: 'from B2', status: 'ok'}, task['data']))
      },
      (error) => {
        logger.info('[B2Component:error] got error = ' + JSON.stringify(error, undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().error(new TxTask({method: 'from B2', status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[B2Component:undo] undo got task = ' + JSON.stringify(task, undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          this.mountpoint.reply().next(new TxTask({method: 'undo from B2', status: 'ok'}, task['data']))
      }
    );

  }

  getReply() {
    return JSON.stringify(this.reply);
  }

}  