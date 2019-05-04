import createLogger from 'logging'; 
const logger = createLogger('S6GoTo');

import { TxTask } from '../../../src/tx-task';
import { TxSinglePointRegistry } from '../../../src';

export class S6GotoComponent {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::S6::Goto');

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[S6GotoComponent:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          

        let data = task.getData();      
        data.tracking.push('S6GotoComponent');  

        task.reply().next(new TxTask({method: 'from S6', status: 'ok'}, data))
      },
      (error: TxTask<any>) => {
        logger.info('[S6GotoComponent:error] got error = ' + JSON.stringify(error.get(), undefined, 2));

        let data = error.getData();
        data.tracking.push('S6GotoComponent');

        error.reply().error(new TxTask({method: 'from S6', status: 'ERROR'}, data))
      }
    );

    this.singlepoint.undos().subscribe(
      (task) => {
          logger.info('[S6GotoComponent:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));

          task.reply().next(new TxTask({method: 'undo from S1', status: 'ok'}, task['data']))
      }
    );

  }

}  