import { TxMountPoint } from './tx-mountpoint';
import { TxTask } from './tx-task';

export type TxCallback = (task: TxTask<any>, mountpoint?: TxMountPoint) => void;