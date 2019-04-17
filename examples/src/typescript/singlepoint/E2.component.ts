
import createLogger from 'logging'; 
const logger = createLogger('E2Component');

import { TxSinglePointRegistry } from 'rx-txjs';
import { TxTask } from 'rx-txjs';

export default class E2Component {
  private singlepoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::E2');

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task) => {
        logger.info('[E2Component:task] got task = ' + JSON.stringify(task.get(), undefined, 2));
                
        task.reply().next(new TxTask({method: 'from E2', direction: task.getHead().direction, status: 'ok'}, task['data']))                
      },
      (error: TxTask<any>) => {
        logger.info('[E2Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));        
           
        error.reply().error(new TxTask({method: 'from E2', direction: error.getHead().direction, status: 'ERROR'}, error['data']))
      }
    );

    this.singlepoint.undos().subscribe(
      (task) => {
          logger.info('[E2Component:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));          
          
          task.reply().next(new TxTask({method: 'undo from E2', status: 'ok'}, task['data']))
      }
    )
  }

}  
