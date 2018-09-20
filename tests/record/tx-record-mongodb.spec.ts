import createLogger from 'logging';
const logger = createLogger('Record-MongoDB-Test');

import 'mocha';
import {expect} from 'chai';
import {assert} from 'chai';

import * as uuid from 'uuid/v4';
import { TxRecordPersistMongoDB, TxMongoDBJobId } from "../../src";
import { TxRecordIndexSave, TxRecordInfoSave } from "../../src";

describe('Record MongoDB - Insert | Update | Read', () => {

  logger.info('ATTENTION: Make sure you have mongodb running, you can use docker:');
  logger.info('docker run --name mongodb -p 27017:27017 -v ~/data:/data/db -d mongo');

  const exeUuid = uuid();
  const jobUuid = uuid();

  let index: TxRecordIndexSave;
  let infoTasks: TxRecordInfoSave;
  let infoReply: TxRecordInfoSave;

  index = {
    executeUuid: exeUuid,
    sequence: 1,
    component: "GITHUB::READ",
    method: "execute",
    job: {
      name: "Job-1",
      uuid: jobUuid
    }
  } as TxRecordIndexSave;

  infoTasks = {
    tasks: {
      head: {
        method: "create",
        status: "ok"
      },
      data: {
        name: "this is the rest of the data object"
      }
    }
  } as TxRecordInfoSave;

  infoReply = {
    reply: {
      head: {
        method: "reply-create",
        status: "reply-ok"
      },
      data: {
        name: "reply : this is the rest of the reply data object"
      }
    }
  } as TxRecordInfoSave;

  function toExecutionId(document) {
    return {uuid: document.executeUuid, sequence: document.sequence};
  }

  /**
   */
  it('tx-record-mongodb.spec: check insert is working', async () => {
    logger.info('tx-record-mongodb.spec: check insert is working');

    let db = new TxRecordPersistMongoDB();

    await db.connect('mongodb://localhost:27017');

    logger.info("exeUuid uuid = " + exeUuid);
    logger.info("jobUuid uuid = " + jobUuid);

    let result;
    try {
      await db.insert(index, infoTasks);
      result = await db.asking({uuid: index.executeUuid, sequence: index.sequence});
    }
    catch (e) {
      logger.error("ERROR: on insert document - " + JSON.stringify(index, undefined, 2))
      assert(false);
    }

    expect(index.executeUuid).to.equal(result[0].executeUuid);
    expect(index.sequence).to.equal(result[0].sequence);
    expect(index.component).to.equal(result[0].component);
    expect(index.method).to.equal(result[0].method);
    expect(index.job).to.deep.equal(result[0].job);
    expect(infoTasks.tasks).to.deep.equal(result[0].tasks);
  });

  it('tx-record-mongodb.spec: check update is working', async () => {
    logger.info('tx-record-mongodb.spec: check update is working');

    let db = new TxRecordPersistMongoDB();

    await db.connect('mongodb://localhost:27017');

    logger.info("exeUuid uuid = " + exeUuid);
    logger.info("jobUuid uuid = " + jobUuid);

    await db.connect('mongodb://localhost:27017');

    let result;
    try {
      await db.update(index, infoReply);
      result = await db.asking({uuid: index.executeUuid, sequence: index.sequence});
    }
    catch (e) {
      logger.error("ERROR: on insert document - " + JSON.stringify(index, undefined, 2))
      assert(false);
    }

    expect(index.executeUuid).to.equal(result[0].executeUuid);
    expect(index.sequence).to.equal(result[0].sequence);
    expect(index.component).to.equal(result[0].component);
    expect(index.method).to.equal(result[0].method);
    expect(index.job).to.deep.equal(result[0].job);
    expect(infoTasks.tasks).to.deep.equal(result[0].tasks);
    expect(infoReply.reply).to.deep.equal(result[0].reply);
  });

  it('tx-record-mongodb.spec: check insert | udpate | asking is working', async () => {
    logger.info('tx-record-mongodb.spec: check insert is working');
    let db = new TxRecordPersistMongoDB();

    await db.connect('mongodb://localhost:27017');

    const exeUuid = uuid();
    const jobUuid = uuid();

    logger.info("exeUuid uuid = " + exeUuid);
    logger.info("jobUuid uuid = " + jobUuid);

    let index: TxRecordIndexSave;
    let infoTasks: TxRecordInfoSave;
    let infoReply: TxRecordInfoSave;

    index = {
      executeUuid: exeUuid,
      sequence: 1,
      component: "GITHUB::READ",
      method: "execute",
      job: {
        name: "Job-1",
        uuid: jobUuid
      }
    } as TxRecordIndexSave;

    infoTasks = {
      tasks: {
        head: {
          method: "create",
          status: "ok"
        },
        data: {
          name: "this is the rest of the data object"
        }
      }
    } as TxRecordInfoSave;

    infoReply = {
      reply: {
        head: {
          method: "reply-create",
          status: "reply-ok"
        },
        data: {
          name: "reply : this is the rest of the reply data object"
        }
      }
    } as TxRecordInfoSave;

    let result;
    try {
      await db.insert(index, infoTasks);
      await db.update(index, infoReply);
      result = await db.asking({uuid: index.executeUuid, sequence: index.sequence});
      result.forEach(item => { delete item['_id']; });
    }
    catch (e) {
      logger.error("ERROR: on insert document - " + JSON.stringify(index, undefined, 2))
      assert(false);
    }

    expect(index.executeUuid).to.equal(result[0].executeUuid);
    expect(index.sequence).to.equal(result[0].sequence);
    expect(index.component).to.equal(result[0].component);
    expect(index.method).to.equal(result[0].method);
    expect(index.job).to.deep.equal(result[0].job);
    expect(infoTasks.tasks).to.deep.equal(result[0].tasks);
    expect(infoReply.reply).to.deep.equal(result[0].reply);
  });

  it('tx-record-mongodb.spec: check delete', async () => {
    logger.info('tx-record-mongodb.spec: check delete');
    let db = new TxRecordPersistMongoDB();

    await db.connect('mongodb://localhost:27017');

    const exeUuid = uuid();
    const jobUuid = uuid();

    let index: TxRecordIndexSave;
    let infoTasks: TxRecordInfoSave;
    let infoReply: TxRecordInfoSave;

    index = {
      executeUuid: exeUuid,
      sequence: 1,
      component: "GITHUB::DELETE",
      method: "execute",
      job: {
        name: "Job-delete",
        uuid: jobUuid
      }
    } as TxRecordIndexSave;

    infoTasks = {
      tasks: {
        head: {
          method: "create",
          status: "ok"
        },
        data: {
          name: "this is the rest of the data object"
        }
      }
    } as TxRecordInfoSave;

    infoReply = {
      reply: {
        head: {
          method: "reply-create",
          status: "reply-ok"
        },
        data: {
          name: "reply : this is the rest of the reply data object"
        }
      }
    } as TxRecordInfoSave;

    logger.info("exeUuid uuid = " + exeUuid);
    logger.info("jobUuid uuid = " + jobUuid);

    // create the documents in the database execute and job
    let result;
    try {
      await db.insert(index, infoTasks);
      await db.update(index, infoReply);
      result = await db.asking({uuid: index.executeUuid, sequence: index.sequence});
      logger.info('[tx-record-mongodb.spec:delete] execute result.length = ' + result.length)
    }
    catch (e) {
      logger.error("ERROR: on insert document - " + JSON.stringify(index, undefined, 2))
      assert(false);
    }

    // check that execute and job where created
    expect(index.executeUuid).to.equal(result[0].executeUuid);
    expect(index.sequence).to.equal(result[0].sequence);
    expect(index.component).to.equal(result[0].component);
    expect(index.method).to.equal(result[0].method);
    expect(index.job).to.deep.equal(result[0].job);
    expect(infoTasks.tasks).to.deep.equal(result[0].tasks);

    let jobId = new TxMongoDBJobId();
    result = await db.collection.jobs.find(jobId.build(index).toKey()).toArray();
    logger.info('[tx-record-mongodb.spec:delete] job result.length = ' + result.length)
    //logger.info('[tx-record-mongodb.spec:delete] job result = ' + JSON.stringify(result, undefined, 2));

    expect(jobId.uuid).to.equal(result[0].uuid);
    expect(jobId.job.uuid).to.equal(result[0].job.uuid);
    expect(jobId.job.name).to.equal(result[0].job.name);

    try {
      await db.delete(toExecutionId(index));
      result = await db.asking(toExecutionId(index));
      logger.info('[tx-record-mongodb.spec:delete] result.length execute = ' + result.length)
    }
    catch (e) {
      logger.error("ERROR: on insert document - " + JSON.stringify(index, undefined, 2))
      assert(false);
    }
    expect(0).to.equal(result.length);
    result = await db.collection.jobs.find(jobId.build(index).toKey()).toArray();
    logger.info('[tx-record-mongodb.spec:delete] job result.length = ' + result.length)
    expect(0).to.equal(result.length);

  });
});
