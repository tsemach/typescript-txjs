import createLogger from 'logging'; 
const logger = createLogger('C1');

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxMountPoint } from '../../src/tx-mountpoint';
import { TxTask } from '../../src/tx-task';

export class C1Component {  
  mountpoint: TxMountPoint;

  method = '';
  reply: any;

  constructor() {
    TxMountPointRegistry.instance.del('GITHUB::GIST::C1');
    this.mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C1');

    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C1Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask({method: 'from C1', status: 'ok'}, task['data']))
      },
      (error) => {
        logger.info('[C1Component:error] got error = ' + JSON.stringify(error, undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().error(new TxTask({method: 'from C1', status: 'ERROR'}, error['data']))
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

export default new C1Component();