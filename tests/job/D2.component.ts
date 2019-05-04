import createLogger from 'logging';
const logger = createLogger('Job-Test');

import { TxComponent } from '../../src/tx-component';
import {TxMountPointRxJSRegistry} from '../../src/tx-mountpointrxjs-registry';
import { TxTask } from '../../src/tx-task';

@TxComponent({
  selector: 'GITHUB::GIST::D2',
  tasks: 'tasks',
  undos: 'undos'
})
export class D2Component {
  [x: string]: any;
  constructor() {
    logger.info("[D2Component:constructor] ctor ..");      
  }

  tasks(data) {
    logger.info('[D2Component:tasks] is called, data = ' + JSON.stringify(data.get()));
    this.mountpoint().reply().next(new TxTask({method: '[D2Component:tasks] tasks from D1', status: 'ok'}, data['data']));
  }

  undos(data) {
    logger.info('[D1Component:undos] is called, data = ' + JSON.stringify(data.get()));
    this.mountpoint().reply().next(new TxTask({method: '[D2Component:undos] undos from D1', status: 'ok'}, data['data']));
  }
}
