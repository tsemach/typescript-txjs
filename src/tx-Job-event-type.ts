import { TxTask } from "./tx-task";
import { TxJob } from './tx-job';

export interface TxJobEventType {  
  job: TxJob;
  task: TxTask<any>;
}
