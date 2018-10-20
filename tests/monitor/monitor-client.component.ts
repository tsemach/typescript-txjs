
import createLogger from 'logging'; 
const logger = createLogger('C1');

import { TxTask } from '../../src/tx-task';
import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxMonitorServerTaskHeader } from './../../src/monitor/tx-monitor-server-task-header';

export class MonitorClientComponent {
  private mountpoint = TxMountPointRegistry.instance.create('EXAMPLE::MONITOR::CLIENT');

  method = '';
  reply: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C1Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          
        this.method = task['method'];

        // just send the reply to whom is 'setting' on this reply subject
        this.mountpoint.reply().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, task['data']));
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

export default new MonitorClientComponent();