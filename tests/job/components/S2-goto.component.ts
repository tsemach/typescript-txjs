
import createLogger from 'logging'; 
const logger = createLogger('S2GoTo');

import { TxTask } from '../../../src/tx-task';
import { TxSinglePointRegistry } from '../../../src';

export class S2GotoComponent {
  singlepoint = TxSinglePointRegistry.instance.create('GITHUB::S2::Goto');

  constructor() {
    this.singlepoint.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[S2GotoComponent:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));

        let data = task.getData();
        data.tracking.push('S2GotoComponent');
        
        if (data.callError === 'GITHUB::S2::Goto') {
          task.reply().error(new TxTask({method: 'from S2', status: 'ERROR'}, data), {goto: 'GITHUB::S4::Goto'});

          return;
        }

        task.reply().next(new TxTask({method: 'from S2', status: 'ok'}, data), {goto: 'GITHUB::S4::Goto'}) 
      },
      (error: TxTask<any>) => {
        logger.info('[S2GotoComponent:error] got error = ' + JSON.stringify(error.get(), undefined, 2));

        let data = error.getData();
        data.tracking.push('S2GotoComponent');        

        error.reply().error(new TxTask({method: 'from S2', status: 'ERROR'}, data))
      }
    );

    this.singlepoint.undos().subscribe(
      (task: TxTask<any>) => {
          logger.info('[S2GotoComponent:undo] undo got task = ' + JSON.stringify(task.get(), undefined, 2));

          task.reply().next(new TxTask({method: 'undo from S2', status: 'ok'}, task['data']))
      }
    );

  }

}  