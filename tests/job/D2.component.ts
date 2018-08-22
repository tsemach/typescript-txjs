import createLogger from 'logging';
const logger = createLogger('Job-Test');

import { TxComponent } from '../../src/tx-component';
import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import { TxTask } from '../../src/tx-task';

@TxComponent({
  selector: 'GITHUB::GIST::D2',
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
    this.mountpoint().reply().next(new TxTask('[D2Component:undos] undos from D1', 'ok', data['data']));
  }
}
