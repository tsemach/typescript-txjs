import createLogger from 'logging'; 
const logger = createLogger('DistributeBull');

import { TxMountPointRegistry } from './tx-mountpoint-registry';
import Queue = require("bull");

import { TxDistributeSourceType, TxDistribute, TxDistributeType } from './tx-disribute';
import { TxTask } from './tx-task';
import TxNames from './tx-names';
import { TxDistributeComponentHead } from './tx-distribute-component-head';
import { TxJobExecutionOptions } from './tx-job-execution-options';

interface TxRadisConnectionParams {
  redis: {
    port: number, 
    host: string, 
    password: string
  }
}

export class TxDistributeBull implements TxDistribute {
  
  private readonly name = 'distributer'
  private _distributer = null;

  constructor(connection: TxRadisConnectionParams | string) {
    logger.info(`going to connect to '${connection}`)

    if (typeof connection === 'string') {
      this._distributer = new Queue(this.name, connection);
      this.subscribe();

      return
    }    
    this._distributer = new Queue(this.name, connection);        

    this.subscribe();
  }

  send(from: TxDistributeSourceType, type: TxDistributeType, task: TxTask<any>, options: TxJobExecutionOptions): Promise<any> {        
    return Promise.resolve(this._distributer.add({from, type, task: task.get(), options}));    
  }

  subscribe() {
    this._distributer.process((job, done) => {
      logger.info(`job process callback  from '${job.data}`)
      TxMountPointRegistry
        .instance
        .get(TxNames.RX_TXJS_DISTRIBUTE_COMPONENT)
        .tasks()
        .next(new TxTask<TxDistributeComponentHead>({method: 'run', type: job.data.type}, job.data))

      done();
    });
  }
}

