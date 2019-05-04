import createLogger from 'logging'; 
const logger = createLogger('S4GoTo');

import { TxTask } from '../../../src/tx-task';
import { TxSinglePointRegistry } from '../../../src';

export class S4GotoComponent {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::S4::Goto');


  constructor() {
    this.singlepoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[S4GotoComponent:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));            
        
        let data = task.getData();        
        data.tracking.push('S4GotoComponent');
        
        task.reply().next(new TxTask({method: 'from S4', status: 'ok'}, data));
      },
      (error: TxTask<any>) => {
        logger.info('[S4GotoComponent:error] got error = ' + JSON.stringify(error.get(), undefined, 2));

        let data = error.getData();
        data.tracking.push('S4GotoComponent');
        
        error.reply().error(new TxTask({method: 'from S4', status: 'ERROR'}, data))
      }
    );

    this.singlepoint.undos().subscribe(
      (task: TxTask<any>) => {
          logger.info('[S4GotoComponent:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));

          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from S1', status: 'ok'}, task['data']))
      }
    );

  }

}  