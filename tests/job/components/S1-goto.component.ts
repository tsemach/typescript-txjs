import createLogger from 'logging'; 
const logger = createLogger('S1GoTo');

import { TxTask } from '../../../src/tx-task';
import { TxSinglePointRegistry } from '../../../src';

export class S1GotoComponent {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::S1::Goto');

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[S1GotoComponent:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));

        let data = task.getData();
        data.tracking.push('S1GotoComponent');        
        
        task.reply().next(new TxTask({method: 'from S1', status: 'ok'}, data));
      },
      (error: TxTask<any>) => {
        logger.info('[S1GotoComponent:error] got error = ' + JSON.stringify(error.get(), undefined, 2));        

        let data = error.getData();
        data.tracking.push('S1GotoComponent');        

        error.reply().error(new TxTask({method: 'from S1', status: 'ERROR'}, data))
      }
    );

    this.singlepoint.undos().subscribe(
      (task: TxTask<any>) => {
          logger.info('[S1GotoComponent:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));          

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from S1', status: 'ok'}, task['data']))
      }
    );

  }

}  