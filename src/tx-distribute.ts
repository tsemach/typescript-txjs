
import { TxMountPointName } from './tx-mountpoint-name';
import { TxTask } from './tx-task';
import { TxJobJSON } from './tx-job-json';
import { TxJobExecutionOptions } from './tx-job-execution-options';

export type TxDistributeType = 'job' | 'component';
export type TxDistributeSourceType = TxJobJSON | TxMountPointName;

export interface TxDistribute {
  send(from: TxDistributeSourceType, type: TxDistributeType, task: TxTask<any>, options: TxJobExecutionOptions): Promise<any>;
}