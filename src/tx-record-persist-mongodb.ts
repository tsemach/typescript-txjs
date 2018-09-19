import createLogger from 'logging';
const logger = createLogger('TxRecordPersistMongoDB');
import { MongoClient as MONGO } from "mongodb";

import {TxRecordInfoSave, TxRecordPersistAdapter} from './tx-record-persist-adapter';
import { TxRecordIndexSave, TxRecordRead } from './tx-record-persist-adapter';
import { TxJobExecutionId } from "./tx-job-execution-id";

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

interface TxMongoDBDocumentJob {
  uuid: string,
  job: {
    name: string,
    uuid: string
  }
}

export class TxRecordPersistMongoDB implements TxRecordPersistAdapter {
  db: any;
  exct: any;
  jobs: any;

  constructor() {
  }

  async connect(url) {
    const client = await MONGO.connect(url, {useNewUrlParser: true});

    this.db = client.db('txjs');

    this.exct = await this.db.collection('execute');
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
    //let document = Object.assign({date: {tasks: '', reply: ''}}, index) as TxMongoDBDocumentExecute;
    // let document = Object.assign({}, index) as TxMongoDBDocumentExecute;
    //
    // document = this.seDocument(index, info);
    //
    // if (info.tasks) {
    //   document.tasks = Object.assign({}, info.tasks);
    //   //document.date.tasks = (new Date()).toString();
    // }
    //
    // if (info.reply) {
    //   document.reply = Object.assign({}, info.reply);
    //   //document.date.reply = (new Date()).toString();
    // }
    let document = this.setDocument(index , info);

    console.log("INSERT: document = " + JSON.stringify(document, undefined, 2));

    let job: TxMongoDBDocumentJob = {uuid: index.executeUuid, job: index.job};

    try {
      await this.exct.insertOne(document);
      await this.jobs.insertOne(job);
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
    //let document = Object.assign({date: {tasks: '', reply: ''}}, index) as TxMongoDBDocumentExecute;
    // let document = Object.assign({}, index) as TxMongoDBDocumentExecute;
    //
    // if (info.tasks) {
    //   document.tasks = Object.assign({}, info.tasks);
    //   //document.date.tasks = (new Date()).toString();
    // }
    // if (info.reply) {
    //   document.reply = Object.assign({}, info.reply);
    //   //document.date.reply = (new Date()).toString();
    // }
    let document = this.setDocument(index, info);
    console.log("UPDATE: document = " + JSON.stringify(document, undefined, 2));
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

  /**
   * If executionId.sequence > 0 then get a specific execute (according to its sequence)
   * if executionId.sequence == 0 then get all steps of one job execute (all executions of a specific job run).
   *
   * @param {TxJobExecutionId} executionId
   * @returns {Promise<TxRecordRead[]>}
   */
  async asking(executionId: TxJobExecutionId): Promise<TxRecordRead[]> {
    let result;

    if (executionId.sequence > 0) {
      result = await this.exct.find({
        executeUuid: executionId.uuid
      }).toArray();
    }
    else {
      result = await this.exct.find({
        executeUuid: executionId.uuid,
        sequence: executionId.sequence
      }).toArray();
    }
    console.log("ASKING: = " + JSON.stringify(result, undefined, 2));

    return result as TxRecordRead[];
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

  close() {
    this.db.close();
  }
}


