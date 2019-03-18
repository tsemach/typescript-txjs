import createLogger from 'logging';
const logger = createLogger('Job-Execute-Test');

import 'mocha';
import {expect} from 'chai';

import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxJobExecutionOptions } from "../../src/tx-job-execution-options";
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';
import { TxJobExecutionId, TxJobRegistry } from "../../src";

import { S1Component } from './S1.component';
import { S2Component } from './S2.component';
import { S3Component } from './S3.component';
import { Persist } from "./pesist-driver";

import * as short from 'short-uuid';
import { TxJobServicesEmptyJSON } from '../../src/tx-job-services-json';
import { TxJobServicesComponent } from '../../src/tx-job-services-component';

new TxJobServicesComponent().init();  

describe('Job Class Execute Test', () => {
  new S1Component();
  new S2Component();
  new S3Component();
    
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

  it('tx-job-execute.spec: check running S1-S2-S3 job chain', (done) => {
    logger.info('running: tx-job-execute.spec: check running S1-S2-S3 job chain');

    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

    job.getIsCompleted().subscribe(
      async (data) => {
        console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from S3");
        expect(data['head']['status']).to.equal("ok");
        expect(job.current.name).to.equal('GITHUB::S3');
        expect((await persist.read(job.getUuid())).uuid).to.equal(job.getUuid());
        expect((await persist.read(job.getUuid())).current).to.equal('GITHUB::S3');

        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}
      ),
      {
        persist: {ison: true}
      } as TxJobExecutionOptions
    );        
  });

  it('tx-job-continue-spec: check S1-S2-S3 upJSON with execute', (done) => {
    logger.info('running: tx-job-execute.spec: check S1-S2-S3 upJSON with execute');

    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    let job = new TxJob('Job-1');
    let from = {
      name: "GitHub",
      uuid: uuid,
      block: "GITHUB::S1,GITHUB::S2,GITHUB::S3",
      stack: "GITHUB::S1,GITHUB::S2,GITHUB::S3",
      trace: "",
      single: false,
      revert: false,
      error: false,
      current: "",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence,
      services: TxJobServicesEmptyJSON
    };
    let after = job.upJSON(from).toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.uuid).to.equal(after['uuid']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.single).to.equal(after['single']);
    expect(from.block).to.equal(after['block']);
    expect(from.current).to.equal(after['current']);
    expect(from.executeUuid).to.equal(after['executeUuid']);
    expect(from.sequence).to.equal(after['sequence']);

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from S3");
        expect(data['head']['status']).to.equal("ok");

        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });

});