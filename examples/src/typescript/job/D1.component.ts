import createLogger from 'logging';
const logger = createLogger('Job-Test');

import { TxComponent } from 'rx-txjs';
import { TxTask } from 'rx-txjs';

@TxComponent({
  selector: 'GITHUB::GIST::D1',
  tasks: 'tasks',
  undos: 'undos'
})
export class D1Component {
  [x: string]: any;
  constructor() {
      logger.info("[D1Component:constructor] ctor ..");      
  }

  tasks(data) {
    logger.info('[D1Component:tasks] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask({method: '[D1Component:tasks] tasks from D1', status: 'ok'}, data['data']));
  }

  undos(data) {
    logger.info('[D1Component:undos] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask({method: '[D1Component:undos] undos from D1', status: 'ok'}, data['data']));
  }

}
