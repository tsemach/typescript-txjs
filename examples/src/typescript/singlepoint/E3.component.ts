import createLogger from 'logging'; 
const logger = createLogger('E3');

import { TxSinglePointRegistry } from 'rx-txjs';
import { TxTask } from 'rx-txjs';

export default class E3Component {
  private mountpoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::E3');
  method = '';

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[E3Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));    
        this.method = task['method'];
        
        task.reply().error(new TxTask({method: 'from E3', direction: task.getHead().direction, status: 'ERROR'}, task['data']))
      },
      (error: TxTask<any>) => {
        logger.info('[E3Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
        this.method = error['method'];

        error.reply().error(new TxTask({method: 'from E3', direction: error.getHead().direction, status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task) => {
          logger.info('[E3Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
          this.method = task['method'];

          task.reply().next(new TxTask({method: 'undo from E3', status: 'ok'}, task['data']))
      }
    )    
  }

}  

