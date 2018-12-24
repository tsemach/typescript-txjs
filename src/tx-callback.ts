
import { TxTask } from './tx-task';

export type TxCallback<T>= (task: TxTask<any>, from?: T) => void;

