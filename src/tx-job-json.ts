
/**
 * This is the JSON representation of TxJob
 */
export interface TxJobJSON {
  name: string;
  uuid: string;
  block: string;
  stack: string;
  trace: string;
  single: boolean;
  revert: boolean;
  current: string;
  executeUuid: string;
  sequence: number;
}
