import createLogger from 'logging'; 
const logger = createLogger('C1');

import { TxMountPointRegistry } from '../src/tx-mountpoint-registry';
import { TxTask } from '../src/tx-task';

export class C1Component {
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C1');
  reply: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C1Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask('C1', 'ok', task['data']))
      }
    )
  }

  getReply() {
    return JSON.stringify(this.reply);
  }

}  