import { TxJobJSON } from "./tx-job-json";

export interface TxJobRunnerPersistAdapter {
  save(uuid: string, data: TxJobJSON, name?: string): boolean;
  read(uuid: string): TxJobJSON;
}


