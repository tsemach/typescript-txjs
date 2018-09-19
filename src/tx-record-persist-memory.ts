import createLogger from 'logging';
const logger = createLogger('TxRecordPersistMemory');
import * as uuid from 'uuid/v4';

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

interface TxMemoryDocumentJob {
  uuid: string,
  job: {
    name: string,
    uuid: string
  }
}

export class TxRecordPersistMemory implements TxRecordPersistAdapter {
  private _exct = new Map<string, TxMemoryDocumentExecute>();
  private _jobs = new Map<string, TxMemoryDocumentJob>();

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

    if (this._exct.has(this.toIndicator(executeId))) {
      throw new Error(`[TxRecordPersistMemory:insert] already exist ${JSON.stringify(executeId)}`);
    }
    let job: TxMemoryDocumentJob = {uuid: index.executeUuid, job: index.job};

    try {
      this._exct.set(this.toIndicator(executeId), document);
      this._jobs.set(job.uuid, job);
    }
    catch (e) {
      logger.error(`[TxRecordPersistMemory::insert] ERROR: insert execute: ${executeId.uuid}:${executeId.sequence}`);
      logger.error(`[TxRecordPersistMemory::insert] ERROR: e = ${e.toString()}`);
    }
    logger.info(`[TxRecordPersistMemory::insert] insert execute: ${this.toIndicator(executeId)}`);
  }

  update(index: TxRecordIndexSave , info: TxRecordInfoSave) {
    if ( ! index.executeUuid ) {
      throw new Error('ERROR: index.uuit (execute uuid) is not exist.');
    }

    let executeId = this.toExecutionId(index);
    if ( ! this._exct.has(this.toIndicator(executeId)) ) {
      throw new Error(`[TxRecordPersistMemory:update] not exist ${JSON.stringify(executeId)}`);
    }

    let document  = Object.assign(this._exct.get(this.toIndicator(executeId)), index, info);
    try {
      this._exct.set(this.toIndicator(executeId), document);
    }
    catch (e) {
      logger.error(`[TxRecordPersistMemory::update] ERROR: updating execute: ${executeId.uuid}:${executeId.sequence}`);
      logger.error(`[TxRecordPersistMemory::update] ERROR: updating on job: ${document.job.name}:${document.job.uuid}`);
      logger.error(`[TxRecordPersistMemory::update] ERROR: e = ${e.toString()}`);
    }
    logger.info(`[TxRecordPersistMemory::update] update execute: ${this.toIndicator(executeId)}`);
  }

  delete(executionId: TxJobExecutionId) {
    let deleted = 0;
    let isDeleted;

    // if executionId.sequence > 0 then remove just this id.
    if (executionId.sequence > 0) {
      isDeleted = this._exct.delete(this.toIndicator(executionId));
      this._jobs.delete(executionId.uuid);

      logger.info(`[TxRecordPersistMemory:delete] ${JSON.stringify(executionId)} delete: ${isDeleted}`);

      return isDeleted ? 1 : 0;
    }

    // if executionId.sequence === 0 then remove all instances of execution ids
    for (let id of this._exct.keys()) {

      if (id !== this.toIndicator(executionId)) {
        continue;
      }

      isDeleted = this._exct.delete(id);
      if ( ! isDeleted ) {
        throw new Error(`unable to delete id: ${JSON.stringify(id)}`);
      }
      deleted++;
    }
    logger.info(`[TxRecordPersistMemory::delete] delete: ${this.toIndicator(executionId)}, deleted: ${deleted}`);

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
      result.push(this._exct.get(this.toIndicator(executionId)));

      return Promise.resolve(result as TxRecordRead[]);
    }

    // if executionId.sequence === 0 then remove all instances of execution ids
    for (let id of this._exct.keys()) {
      if (id !== this.toIndicator(executionId)) {
        continue;
      }
      result.push(this._exct.get(id));

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

  dump() {
    console.log("MEMEOR:LDUMP ");
    for (let [id, ex] of this.exct) {
      console.log('[TxRecordPersistMemory:dump] id: ' + JSON.stringify(id) + ' =>' + JSON.stringify(ex, undefined, 2));
    }
  }

  toExecutionId(index: TxRecordIndexSave): TxJobExecutionId {
    return {uuid: index.executeUuid, sequence: index.sequence};
  }

  toIndicator(index: TxJobExecutionId): string {
    return `${index.uuid}:${index.sequence}`;
  }

  private get exct() {
    return this._exct;
  }

  private get jobs() {
    return this._jobs;
  }

  getExecuteSize() {
    return this.exct.size;
  }

  close() {
    this._exct = new Map<string , TxMemoryDocumentExecute>();
  }
}


