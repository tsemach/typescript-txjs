
import createLogger from 'logging'; 
const logger = createLogger('C2');

import { TxMountPointRxJSRegistry } from '../../src/tx-mountpointrxjs-registry';
import { TxTask } from '../../src/tx-task';

export class C2Component {
  private mountpoint = TxMountPointRxJSRegistry.instance.create('GITHUB::GIST::C2');    
  method = '';
  //task: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C2Component:task] got task = ' + JSON.stringify(task, undefined, 2));
        this.method = task['method'];
        // this.task = task;
        
        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask({method: 'from C2', status: 'ok'}, task['data']))
      },
      (error) => {
        logger.info('[C2Component:error] got error = ' + JSON.stringify(error, undefined, 2));
        this.method = error['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().error(new TxTask({method: 'from C2', status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[C2Component:undo] undo got task = ' + JSON.stringify(task, undefined, 2));
          this.method = task['method'];

          // just send the reply to whom is 'setting' on this reply subject
          this.mountpoint.reply().next(new TxTask({method: 'undo from C2', status: 'ok'}, task['data']))
      }
    )
  }

  // getTask() {
  //   return this.task;
  // }
}  

export default new C2Component();
