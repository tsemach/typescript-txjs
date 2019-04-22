import createLogger from 'logging'; 
const logger = createLogger('E1');

import { TxSinglePointRegistry } from 'rx-txjs';
import { TxTask } from 'rx-txjs';
import { timingSafeEqual } from 'crypto';

export default class E1Component {
  private mountpoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::E1');

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[E1Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));                  

        if (task.getHead().direction === 'forward') {
          task.reply().error(new TxTask({method: 'from E1', direction: task.getHead().direction, status: 'ERROR'}, task['data']))

          return;
        }

        task.reply().next(new TxTask({method: 'from E1', direction: task.getHead().direction, status: 'ok'}, task['data']))
      },
      (error: TxTask<any>) => {        
        logger.info('[E1Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));        

        error.reply().error(new TxTask({method: 'from E1', direction: error.getHead().direction, status: 'ERROR'}, error['data']))
      }
    );

    this.mountpoint.undos().subscribe(
      (task: TxTask<any>) => {
          logger.info('[E1Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));

          task.reply().next(new TxTask({method: 'undo from E1', status: 'ok'}, task['data']))
      }
    );

  }

}  