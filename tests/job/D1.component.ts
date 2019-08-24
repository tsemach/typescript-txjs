import createLogger from 'logging';
const logger = createLogger('Job-Test');

import { TxComponent } from '../../src/tx-component';
import { TxTask } from '../../src/tx-task';

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

  tasks(data: TxTask<any>) {
    logger.info('[D1Component:tasks] is called, data = ' + JSON.stringify(data.get()));
    data.reply().next(new TxTask({method: '[D1Component:tasks] tasks from D1', status: 'ok'}, data['data']));
  }

  undos(data: TxTask<any>) {
    logger.info('[D1Component:undos] is called, data = ' + JSON.stringify(data.get()));
    data.reply().next(new TxTask({method: '[D1Component:undos] undos from D1', status: 'ok'}, data['data']));
  }

}
