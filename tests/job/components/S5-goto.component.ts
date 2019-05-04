import createLogger from 'logging'; 
const logger = createLogger('S5GoTo');

import { TxTask } from '../../../src/tx-task';
import { TxSinglePointRegistry } from '../../../src';

export class S5GotoComponent {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::S5::Goto');

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[S5GotoComponent:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          

        let data = task.getData();      
        data.tracking.push('S5GotoComponent');

        if (data.callError === 'GITHUB::S5::Goto') {
          task.reply().error(new TxTask({method: 'from S5', status: 'ERROR'}, data), {goto: 'GITHUB::S4::Goto'});

          return;
        }

        task.reply().next(new TxTask({method: 'from S5', status: 'ok'}, data))
      },
      (error: TxTask<any>) => {
        logger.info('[S5GotoComponent:error] got error = ' + JSON.stringify(error.get(), undefined, 2));
   
        let data = error.getData();
        data.tracking.push('S5GotoComponent');

        error.reply().error(new TxTask({method: 'from S5', status: 'ERROR'}, data))
      }
    );

    this.singlepoint.undos().subscribe(
      (task) => {
          logger.info('[S5GotoComponent:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));
   
          // just send the reply to whom is 'setting' on this reply subject
          task.reply().next(new TxTask({method: 'undo from S2', status: 'ok'}, task['data']))
      }
    );

  }

}  