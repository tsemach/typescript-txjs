import { TxTask } from "rx-txjs";

export declare interface TxRecordIndexSave {
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

export declare interface TxRecordInfoSave {
  tasks: TxTask<any>,
  reply:TxTask<any>
}

export declare interface TxRecordRead extends TxRecordIndexSave, TxRecordInfoSave {
}
