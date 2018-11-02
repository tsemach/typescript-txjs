import createLogger from 'logging'; 
const logger = createLogger('C3');

import { TxMountPointRegistry } from '../../../src/tx-mountpoint-registry';
import { TxMountPoint } from '../../../src/tx-mountpoint';
import { TxTask } from '../../../src/tx-task';

export class C3Component {
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C3');
  method = '';

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C3Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));    
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask({method: 'from C3', status: 'ok'}, task['data']))
      },
      (error) => {
        logger.info('[C3Component:error] got error = ' + JSON.stringify(error, undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().error(new TxTask({method: 'from C3', status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[C3Component:undo] undo got task = ' + JSON.stringify(task, undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          this.mountpoint.reply().next(new TxTask({method: 'undo from C3', status: 'ok'}, task['data']))
      }
    )    
  }

}  

