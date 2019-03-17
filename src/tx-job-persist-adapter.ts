import { TxJobJSON } from "./tx-job-json";

export interface TxJobPersistAdapter {
  save(uuid: string, data: TxJobJSON, name?: string): boolean;
  read(uuid: string): any;
}


