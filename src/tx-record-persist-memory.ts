import createLogger from 'logging';
const logger = createLogger('TxRecordPersistMemory');

import { TxRecordInfoSave, TxRecordPersistAdapter } from './tx-record-persist-adapter';
import { TxRecordIndexSave, TxRecordRead } from './tx-record-persist-adapter';
import { TxJobExecutionId } from './tx-job-execution-id';

interface TxMemoryDocumentExecute {
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
  tasks: {
    head: any,
    data: any
  }
  reply: {
    head: any
    data: any
  }
}

export class TxRecordPersistMemory implements TxRecordPersistAdapter {
  exct = new Map<string, TxMemoryDocumentExecute>();

  constructor() {
  }

  /**
   * Insert one execution document into 'execute' collection.
   *
   * _info: may include one of tasks or reply or both.
   *
   * @param {TxRecordIndexSave} index
   * @param {TxRecordInfoSave} info
   * @returns {Promise<void>}
   */
  insert(index: TxRecordIndexSave, info: TxRecordInfoSave) {
    let document = this.setDocument(index , info);
    let executeId = this.toExecutionId(index);

    if (this.exct.has(this.toIndicator(executeId))) {
      throw new Error(`[TxRecordPersistMemory:insert] already exist ${JSON.stringify(executeId)}`);
    }

    try {
      this.exct.set(this.toIndicator(executeId), document);
    }
    catch (e) {
      logger.error(`[TxRecordPersistMemory::insert] ERROR: insert execute: ${executeId.uuid}:${executeId.sequence}`);
      logger.error(`[TxRecordPersistMemory::insert] ERROR: e = ${e.toString()}`);
    }
  }

  update(index: TxRecordIndexSave , info: TxRecordInfoSave) {
    if ( ! index.executeUuid ) {
      throw new Error('ERROR: index.uuit (execute uuid) is not exist.');
    }

    let executeId = this.toExecutionId(index);
    if ( ! this.exct.has(this.toIndicator(executeId)) ) {
      throw new Error(`[TxRecordPersistMemory:update] not exist ${JSON.stringify(executeId)}`);
    }

    let document  = Object.assign(this.exct.get(this.toIndicator(executeId)), index, info);
    try {
      this.exct.set(this.toIndicator(executeId), document);
    }
    catch (e) {
      logger.error(`[TxRecordPersistMemory::update] ERROR: updating execute: ${executeId.uuid}:${executeId.sequence}`);
      logger.error(`[TxRecordPersistMemory::update] ERROR: updating on job: ${document.job.name}:${document.job.uuid}`);
      logger.error(`[TxRecordPersistMemory::update] ERROR: e = ${e.toString()}`);
    }
  }

  delete(executionId: TxJobExecutionId) {
    let deleted = 0;

    // if executionId.sequence > 0 then remove just this id.
    if (executionId.sequence > 0) {
      let isDeleted = this.exct.delete(this.toIndicator(executionId));
      logger.info(`[TxRecordPersistMemory:delete] ${JSON.stringify(executionId)} delete: ${isDeleted}`);

      return isDeleted ? 1 : 0;
    }

    // if executionId.sequence === 0 then remove all instances of execution ids
    for (let id of this.exct.keys()) {

      if (id !== this.toIndicator(executionId)) {
        continue;
      }

      let isDeleted = this.exct.delete(id);
      if ( ! isDeleted ) {
        throw new Error(`unable to delete id: ${JSON.stringify(id)}`);
      }
      deleted++;
    }
    return deleted
  }

  /**
   * If executionId.sequence > 0 then get a specific execute (according to its sequence)
   * if executionId.sequence == 0 then get all steps of one job execute (all executions of a specific job run).
   *
   * @param {TxJobExecutionId} executionId
   * @returns {Promise<TxRecordRead[]>}
   */
  async asking(executionId: TxJobExecutionId): Promise<TxRecordRead[]> {
    let result = [];

    if (executionId.sequence > 0) {
      result.push(this.exct.get(this.toIndicator(executionId)));

      return Promise.resolve(result as TxRecordRead[]);
    }

    // if executionId.sequence === 0 then remove all instances of execution ids
    for (let id of this.exct.keys()) {
      if (id !== this.toIndicator(executionId)) {
        continue;
      }
      result.push(this.exct.get(id));

    }
    return Promise.resolve(result as TxRecordRead[]);
  }

  private setDocument(index: TxRecordIndexSave, info: TxRecordInfoSave): TxMemoryDocumentExecute {
    let document = Object.assign({date: {tasks: '', reply: ''}}, index) as TxMemoryDocumentExecute;

    if ( ! document.date ) {
      document.date = {tasks: '', reply: ''}
    }

    if (info.tasks) {
      document.tasks = Object.assign({}, info.tasks);
      document.date.tasks = (new Date()).toString();
    }

    if (info.reply) {
      document.reply = Object.assign({}, info.reply);
      document.date.reply = (new Date()).toString();
    }

    return document;
  }

  toExecutionId(index: TxRecordIndexSave): TxJobExecutionId {
    return {uuid: index.executeUuid, sequence: index.sequence};
  }

  toIndicator(index: TxJobExecutionId): string {
    return `${index.uuid}:${index.sequence}`;
  }

  close() {
    this.exct = new Map<string , TxMemoryDocumentExecute>();
  }
}


