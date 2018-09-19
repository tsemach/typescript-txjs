import createLogger from 'logging';
const logger = createLogger('TxRecordPersistMongoDB');
import { MongoClient as MONGO } from "mongodb";

import {TxRecordInfoSave, TxRecordPersistAdapter} from './tx-record-persist-adapter';
import { TxRecordIndexSave, TxRecordRead } from './tx-record-persist-adapter';

interface TxMongoDBDocumentExecute {
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
  async insert(index: TxRecordIndexSave , info: TxRecordInfoSave) {
    let document = Object.assign({date: {tasks: '', reply: ''}}, index) as TxMongoDBDocumentExecute;

    if (info.tasks) {
      document.tasks = Object.assign({}, info.tasks);
      document.date.tasks = (new Date()).toString();
    }

    if (info.reply) {
      document.reply = Object.assign({}, info.reply);
      document.date.reply = (new Date()).toString();
    }
    console.log("INSERT: document = " + JSON.stringify(document, undefined, 2));

    let job: TxMongoDBDocumentJob = {uuid: index.uuid, job: index.job};

    try {
      await this.exct.insertOne(document);
      await this.jobs.insertOne(job);
    }
    catch (e) {
      logger.error(`[TxRecordPersistMongoDB::insert] ERROR: inserting execute uuid =${document.uuid} on job ${document.job.name}:${document.job.uuid}`);
      logger.error(`[TxRecordPersistMongoDB::insert] ERROR: e = ${e.toString()}`);
    }
  }

  async update(index: TxRecordIndexSave , info: TxRecordInfoSave) {
    if ( ! index.uuid ) {
      throw new Error('ERROR: index.uuit (execute uuid) is not exist.');
    }
    let document = Object.assign({date: {tasks: '', reply: ''}}, index) as TxMongoDBDocumentExecute;

    if (info.tasks) {
      document.tasks = Object.assign({}, info.tasks);
      document.date.tasks = (new Date()).toString();
    }
    if (info.reply) {
      document.reply = Object.assign({}, info.reply);
      document.date.reply = (new Date()).toString();
    }

    console.log("UPDATE: document = " + JSON.stringify(document, undefined, 2));
    try {
      await this.exct.updateOne({uuid: document.uuid}, {$set: document});
    }
    catch (e) {
      logger.error(`[TxRecordPersistMongoDB::update] ERROR: updating execute uuid: ${document.uuid} on job: ${document.job.name}:${document.job.uuid}`);
      logger.error(`[TxRecordPersistMongoDB::update] ERROR: e = ${e.toString()}`);
    }
  }

  async asking(uuid: string): Promise<TxRecordRead[]> {
      let result = await this.exct.find({uuid: uuid}).toArray();
      console.log("ASKING: = " + JSON.stringify(result, undefined, 2));

      return result as TxRecordRead[];
  }

  close() {
    this.db.close();
  }
}


