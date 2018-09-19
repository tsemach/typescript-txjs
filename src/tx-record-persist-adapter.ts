import { TxTask } from "./tx-task";

export interface TxRecordIndexSave {
  uuid: string,
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
  uuid: string,
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
  asking(uuid: string): Promise<TxRecordRead[]>;
  close();
}


