import { TxTask } from "./tx-task";
import { TxJobExecutionId } from "../src";

export interface TxRecordIndexSave {
  executeUuid: string,
  sequence: number,
  job: {
    name: string
    uuid: string
  },
  component: string,
  method: string,
  date:  {
    tasks: string,
    reply: string
  }
}

export interface TxRecordInfoSave {
  tasks: TxTask<any>,
  reply:TxTask<any>
}

export interface TxRecordRead {
  executeUuid: string,
  sequence: number,
  job: {
    name: string,
    uuid: string
  },
  component: string,
  method: string,
  date: {
    tasks: string,
    reply: string
  },
  tasks: TxTask<any>
  reply: TxTask<any>
}

export interface TxRecordPersistAdapter {
  insert(index: TxRecordIndexSave , info: TxRecordInfoSave): void;
  update(index: TxRecordIndexSave , info: TxRecordInfoSave): void;
  asking(executionId: TxJobExecutionId): Promise<TxRecordRead[]>;
  close();
}


