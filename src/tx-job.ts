import logger = require('logging');

export class TxJob {
  stack = [];
  
  constructor(private name: string = '') {    
  }

  add(txMountPoint) {
    logger.info(`[TxJob:add] going to add '${txMountPoint.name}' mount point`);
    txMountPoint.reply().subscribe(
      (data) => {
        logger.debug(`[TxJob:add] got reply from '${data.method}' method, data = ${JSON.stringify(data, undefined, 2)}`);
        logger.debug(`[TxJob:add] before shift to next task, stack.len = ${this.stack.length}`);
      
        if (this.stack.length > 0) {
          /**
           * make the next move, get the next mountpoint from the stack,
           * and send the data to it's tasks subject.
           */
          let next = this.stack.shift();
          logger.info(`[TxJob:add] going to run next task: ${next.name}`);
          
          next.tasks().next(data);

          // NOTE: !! need to unsubscribe txMountPoint.
          return;
        }
        logger.info(`[TxJob:add] complete running all jobs mount points, stack.legth = ${this.stack.length}`);
      },
      (err) => {
        logger.info('[TxJob:add] error is called');
      },
      () => {
        logger.info('[TxJob:add] complete is called')
      }
    );
    this.stack.push(txMountPoint);
  }

  execute(data) {
    let current = this.stack.shift();
    logger.info(`[TxJob:execute] going to run ${current.name} mount point`);
    
    current.tasks().next(data);
  }
}