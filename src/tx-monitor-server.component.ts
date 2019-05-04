
import createLogger from 'logging'; 
const logger = createLogger('TxMonitorServerComponent');

import { TxMountPointRxJSRegistry } from './tx-mountpointrxjs-registry';
import { TxTask } from './tx-task';
import { TxMonitorServerTaskHeader } from "./tx-monitor-server-task-header";
import { TxMonitorServerApplication } from "./tx-monitor-server-application";
import TxMonitorServerService from './tx-monitor-server-service';

export class TxMonitorServerComponent {
  private mountpoint = TxMountPointRxJSRegistry.instance.create('RX-TXJS::MONITOR::SERVER');

  constructor() {
    logger.info("TxMonitorServerComponent:con't is called, no need to subscribe, the method will take care of it");

    this.mountpoint.tasks().method('start', this);
    this.mountpoint.tasks().method('close', this);

    // this.mountpoint.tasks().subscribe(
    //   (task: TxTask<TxMonitorServerTaskHeader>) => {
    //     logger.info('[TxMonitorServerComponent:tasks] got task = ' + JSON.stringify(task, undefined, 2));          
        
    //     if (task.getHead().method === 'start') {
    //       this.start(task);
    //     }

    //     if (task.getHead().method === 'close') {
    //       this.close();
    //     }

    //   },
    //   (error) => {
    //     logger.info('[TxMonitorServerComponent:error] got error = ' + JSON.stringify(error, undefined, 2));        
    //   }
    // );

    // this.mountpoint.undos().subscribe(
    //   (task) => {
    //     logger.info('[TxMonitorServerComponent:undo] undo got task = ' + JSON.stringify(task, undefined, 2));          
        
    //     this.mountpoint.reply().next(new TxTask({method: 'start'}, {status: 'unsupported'}));
    //   }
    // );

  }

  async start(task) {
    try {
      TxMonitorServerApplication.instance.register('/rx-txjs/monitor', TxMonitorServerService);
      TxMonitorServerApplication.instance.listen(task.data.host, task.data.port);

      this.mountpoint.reply().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, {status: 'ok'}));
    }
    catch (e) {
      this.mountpoint.reply().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, {status: 'error', error: e}));
    }  
  }

  async close() {
    try {      
      TxMonitorServerApplication.instance.close();
      this.mountpoint.reply().next(new TxTask<TxMonitorServerTaskHeader>({method: 'close'}, {status: 'ok'}));
    }
    catch (e) {
      this.mountpoint.reply().next(new TxTask<TxMonitorServerTaskHeader>({method: 'close'}, {status: 'error', error: e}));
    }  
  }
  
}  

export default new TxMonitorServerComponent();