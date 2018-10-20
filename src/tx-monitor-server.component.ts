
import createLogger from 'logging'; 
const logger = createLogger('TxMonitorServerComponent');

import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxTask } from './tx-task';
import { TxMonitorServerTaskHeader } from "./tx-monitor-server-task-header";
import { TxMonitorServerApplication } from "./tx-monitor-server-application";

export class TxMonitorServerComponent {
  private mountpoint = TxMountPointRegistry.instance.create('RX-TXJS::MONITOR::SERVER');

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task: TxTask<TxMonitorServerTaskHeader>) => {
        logger.info('[TxMonitorServerComponent:tasks] got task = ' + JSON.stringify(task, undefined, 2));          
        
        if (task.getHead().method === 'start') {
          this.start(task.data);
        }

      },
      (error) => {
        logger.info('[TxMonitorServerComponent:error] got error = ' + JSON.stringify(error, undefined, 2));        
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
        logger.info('[TxMonitorServerComponent:undo] undo got task = ' + JSON.stringify(task, undefined, 2));          
        
        this.mountpoint.reply().next(new TxTask({method: 'start'}, {status: 'unsupported'}));
      }
    );

  }

  async start(data: any) {
    try {
      TxMonitorServerApplication.instance.listen(data.host || 'localhost', data.port || 3001);
      this.mountpoint.reply().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, {status: 'ok'}));
    }
    catch (e) {
      this.mountpoint.reply().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, {status: 'error', error: e}));
    }  
  }
}  

export default new TxMonitorServerComponent();