import createLogger from 'logging';
const logger = createLogger('Job-Test');

import { 
  TxJob, 
  TxMountPoint, 
  TxComponent,
  TxMountPointRegistry, 
  TxTask 
} from 'rx-txjs';

@TxComponent({
  selector: 'DECORATOR::D2',
  tasks: 'tasks',
  undos: 'undos'
})
export class D2Component {
  constructor() {
    logger.info("[D2Component:constructor] ctor ..");      
  }

  tasks(data) {
    logger.info('[D2Component:tasks] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask('[D2Component:tasks] tasks from D1', 'ok', data['data']));
  }

  undos(data) {
    logger.info('[D1Component:undos] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask('[D2Component:tasks] undos from D1', 'ok', data['data']));
  }
}
