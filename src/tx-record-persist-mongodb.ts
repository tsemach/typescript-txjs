import createLogger from 'logging';
const logger = createLogger('TxRecordPersistMongoDB');
import { MongoClient as MONGO } from "mongodb";

import {TxRecordInfoSave, TxRecordPersistAdapter} from './tx-record-persist-adapter';
import { TxRecordIndexSave, TxRecordRead } from './tx-record-persist-adapter';
import { TxJobExecutionId } from "./tx-job-execution-id";

/**
 * Execute document (written / read from execute collection)
 *
 * this is internal execute document representation of one execution step (of a specific component)
 * The sequence number is the component order number in one particular job run.
 *
 */
interface TxMongoDBDocumentExecute {
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

/**
 * Job document (written / read from job collection)
 *
 * uuid: is the execution uuid.
 * Job: is the job id (uuid:name).
 *
 */
interface TxMongoDBDocumentJob {
  uuid: string,
  job: {
    name: string,
    uuid: string
  }
}

/**
 * Just helper class to represent job id.
 */
export class TxMongoDBJobId {
  uuid: string;     // this is the execution uuid
  job: {
    uuid: string,   // this the job uuid as created in TxJob constructor
    name: string,   // the name as given into TxJob constructor
  };
  constructor() {
    this.uuid = '';
    this.job = {uuid: '', name: ''};
  }

  build(index: TxRecordIndexSave) {
    this.uuid = index.executeUuid;
    this.job = index.job;

    return this;
  }

  toKey() {
    return {"uuid": this.uuid, "job.uuid": this.job.uuid, "job.name": this.job.name};
  }
}

/**
 * This is the MongoDB implementation of the recorder persist adapter.
 *
 * It has two collections "execute" and "jobs".
 * execute collection - store document of each component. the uuid:sequence pair are represent
 * one component. the exection uuid is the same for all component running in this specific job
 * execution.
 *
 */
export class TxRecordPersistMongoDB implements TxRecordPersistAdapter {
  db: any;
  exct: any;
  jobs: any;

  constructor() {
  }

  async connect(url) {
    const client = await MONGO.connect(url, {useNewUrlParser: true});

    this.db = client.db('txjs');

    this.exct = await this.db.collecttion('execute');
    await this.db.createCollection("jobs");

    this.exct = await this.db.collection('execute');
    this.jobs = await this.db.collection('jobs');
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
  async insert(index: TxRecordIndexSave, info: TxRecordInfoSave) {
     let document = this.setDocument(index , info);

    if (await this.exct.countDocuments(this.toExecutionId(document)) > 0) {
      throw new Error(`[TxRecordPersistMongoDB:insert] already exist ${JSON.stringify(this.toExecutionId(document))}`);
    }

    let job: TxMongoDBDocumentJob = {uuid: index.executeUuid, job: index.job};
    try {
      await this.exct.insertOne(document);

      // update the jobs only if not exist
      if (await this.jobs.countDocuments({"uuid": job.uuid, "job.name": job.job.name}) === 0) {
        await this.jobs.insertOne(job);
      }
    }
    catch (e) {
      logger.error(`[TxRecordPersistMongoDB::insert] ERROR: updating execute: ${document.executeUuid}:${document.sequence}`);
      logger.error(`[TxRecordPersistMongoDB::insert] ERROR: updating on job: ${document.job.name}:${document.job.uuid}`);
      logger.error(`[TxRecordPersistMongoDB::insert] ERROR: e = ${e.toString()}`);
    }
  }

  async update(index: TxRecordIndexSave , info: TxRecordInfoSave) {
    if ( ! index.executeUuid) {
      throw new Error('ERROR: index.uuit (execute uuid) is not exist.');
    }

    let document = this.setDocument(index, info);

    if (await this.exct.countDocuments(this.toExecutionId(document)) === 0) {
      throw new Error(`[TxRecordPersistMongoDB:update] not exist ${JSON.stringify(this.toExecutionId(document))}`);
    }

    try {
      await this.exct.updateOne({
          executeUuid: index.executeUuid,
          sequence: index.sequence
        },
        {$set: document}
      );
    }
    catch (e) {
      logger.error(`[TxRecordPersistMongoDB::update] ERROR: updating execute: ${document.executeUuid}:${document.sequence}`);
      logger.error(`[TxRecordPersistMongoDB::update] ERROR: updating on job: ${document.job.name}:${document.job.uuid}`);
      logger.error(`[TxRecordPersistMongoDB::update] ERROR: e = ${e.toString()}`);
    }
  }

  async delete(executionId: TxJobExecutionId) {
    let filter = {executeUuid: executionId.uuid};

    if (executionId.sequence > 0) {
      filter['sequence'] = executionId.sequence;
    }

    let deleted;

    // delete the entry in the execute collection
    deleted = await this.exct.deleteOne(filter);
    logger.info(`[TxRecordPersistMongoDB:delete] execute delete ${JSON.stringify(filter)} delete: ${deleted}`);

    // delete the entry in the jobs collection
    deleted = await this.jobs.deleteOne({uuid: executionId.uuid});
    logger.info(`[TxRecordPersistMongoDB:delete] jobs delete ${JSON.stringify(filter)} delete: ${deleted}`);

    return deleted;
  }

  /**
   * If executionId.sequence > 0 then get a specific execute (according to its sequence)
   * if executionId.sequence == 0 then get all steps of one job execute (all executions of a specific job run).
   *
   * @param {TxJobExecutionId} executionId
   * @returns {Promise<TxRecordRead[]>}
   */
  async asking(executionId: TxJobExecutionId): Promise<TxRecordRead[]> {
    if (executionId.sequence === 0) {
      return await this.exct.find({
        executeUuid: executionId.uuid
      }).toArray();
    }

    return await this.exct.find({
        executeUuid: executionId.uuid,
        sequence: executionId.sequence
      }).toArray() as TxRecordRead[];
  }

  get collection() {
    return {
      exct: this.exct,
      jobs: this.jobs
    }
  }

  private setDocument(index: TxRecordIndexSave, info: TxRecordInfoSave): TxMongoDBDocumentExecute {
    let document = Object.assign({date: {tasks: '', reply: ''}}, index) as TxMongoDBDocumentExecute;

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

  private toExecutionId(document: TxMongoDBDocumentExecute) {
    return {executeUuid: document.executeUuid, sequence: document.sequence};
  }

  close() {
    this.db.close();
  }
}

