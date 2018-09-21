import createLogger from 'logging';
const logger = createLogger('Job-Test');

import { 
  TxComponent,
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
    this.mountpoint().reply().next(new TxTask({name: '[D2Component:tasks] tasks from D1', status: 'ok'}, data['data']));
  }

  undos(data) {
    logger.info('[D1Component:undos] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask({name: '[D2Component:tasks] undos from D1', status: 'ok'}, data['data']));
  }
}
