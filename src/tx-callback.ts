
import { TxTask } from './tx-task';

//export type TxCallback = (task: TxTask<any>) => void;
export type TxCallback<T>= (task: TxTask<any>, from?: T) => void;

