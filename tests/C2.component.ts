
import createLogger from 'logging'; 
const logger = createLogger('C2');

import { TxMountPointRegistry } from '../src/tx-mountpoint-registry';
import { TxTask } from '../src/tx-task';

export class C2Component {
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C2');    
  method = '';
  //task: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C2Component:task] got task = ' + JSON.stringify(task, undefined, 2));
        this.method = task['method'];
        // this.task = task;
        
        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask('C2', 'ok', task['data']))
      }
    )  
  }

  // getTask() {
  //   return this.task;
  // }
}  
