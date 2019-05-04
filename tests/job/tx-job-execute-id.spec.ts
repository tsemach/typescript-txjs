import createLogger from 'logging';
const logger = createLogger('Job-Execute-Id-Test');

import 'mocha';
import {expect} from 'chai';

import { TxMountPointRxJSRegistry } from '../../src/tx-mountpointrxjs-registry';
import { TxJobExecutionOptions } from "../../src/tx-job-execution-options";
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';
import {TxJobExecutionId, TxJobRegistry} from "../../src";

import { C1Component } from './C1.component';
import { C2Component } from './C2.component';
import { C3Component } from './C3.component';
import { Persist } from "./pesist-driver";

import * as short from 'short-uuid';

describe('Job Class', () => {
  let a = 0;
  before(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        a = 1;
        resolve();
      }, 200);
    });
  });

  /**
   */
  it('tx-job-execute-id.spec: ', () => {
    logger.info('running: tx-job-execute-id.spec: ');

    let id: TxJobExecutionId;
    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    id = job.getExecutionId();

    expect(id.uuid).to.equal('');
    expect(id.sequence).to.equal(0);

    job.genExecutionId();
    id = job.getExecutionId();
    expect(id.sequence).to.equal(1);
    //expect(id.getSequence()).to.equal(1);
  });

});