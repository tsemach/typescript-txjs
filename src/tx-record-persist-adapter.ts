import { TxTask } from "./tx-task";
import { TxJobExecutionId } from "../src";

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
  // executeUuid: string,
  // sequence: number,
  // job: {
  //   name: string,
  //   uuid: string
  // },
  // component: string,
  // method: string,
  // date: {
  //   tasks: string,
  //   reply: string
  // },
  // tasks: TxTask<any>
  // reply: TxTask<any>
}

export declare interface TxRecordPersistAdapter {
  /**
   * Insert an execution into storage. The pair executeUuid:sequence consider the execution ID.
   * if executeUuid:sequence exist then throw an exception.
   *
   * It should be possible to retrieve all executions of a specific job.
   *
   * @param {TxRecordIndexSave} index - encapsulate properties about the execution.
   * @param {TxRecordInfoSave} info - a wrapper around tasks and reply data.
   */
  insert(index: TxRecordIndexSave , info: TxRecordInfoSave): void;

  /**
   * Update an exist execution of a specific job. The pair executeUuid:sequence consider the execution ID.
   * if executeUuid:sequence is not exist then throw an exception.
   *
   * @param {TxRecordIndexSave} index - encapsulate properties about the execution.
   * @param {TxRecordInfoSave} info - a wrapper around tasks and reply data.
   */
  update(index: TxRecordIndexSave , info: TxRecordInfoSave): void;

  /**
   * Delete an execution according to its Id
   * If executionId.sequence > 0 then delete a specific execute (according to its sequence)
   * if executionId.sequence == 0 then delete all steps of one job execute (all executions of a specific job run).
   * this is similar to executeUuid:*.
   *
   * @param {TxJobExecutionId} executionId
   */
  delete(executionId: TxJobExecutionId);

  /**
   * Read a specific execution. Should return exection array according to executionId
   *
   * If executionId.sequence > 0 then get a specific execute (according to its sequence)
   * if executionId.sequence == 0 then get all steps of one job execute (all executions of a specific job run).
   * this is similar to executeUuid:*.
   *
   * @param {TxJobExecutionId} executionId - a pair of executeUuid:sequence
   * @returns {Promise<TxRecordRead[]>}
   */
  asking(executionId: TxJobExecutionId): Promise<TxRecordRead[]>;

  /**
   * Close connection to storage.
   */
  close();
}
