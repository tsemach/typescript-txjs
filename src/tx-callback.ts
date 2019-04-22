
import { TxTask } from './tx-task';
import { TxSubscribeOptions } from './tx-subscribe-options';

export type TxCallback<T>= (task: TxTask<any>, from?: T, options?: TxSubscribeOptions) => void;

