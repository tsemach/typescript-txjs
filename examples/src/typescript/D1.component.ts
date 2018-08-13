import createLogger from 'logging';
const logger = createLogger('Job-Test');

import { 
  TxJob, 
  TxMountPoint, 
  TxComponent,
  TxMountPointRegistry, 
  TxTask } from 'rx-txjs';


@TxComponent({
  selector: 'DECORATOR::D1',
  tasks: 'tasks',
  undos: 'undos'
})
export class D1Component {
  constructor() {
      logger.info("[D1Component:constructor] ctor ..");      
  }

  tasks(data) {
    logger.info('[D1Component:tasks] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask('[D1Component:tasks] tasks from D1', 'ok', data['data']));
  }

  undos(data) {
    logger.info('[D1Component:undos] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask('[D1Component:tasks] undos from D1', 'ok', data['data']));
  }
}
