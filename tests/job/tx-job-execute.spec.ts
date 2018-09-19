import createLogger from 'logging';
const logger = createLogger('Job-Execute-Test');

import 'mocha';
import {expect} from 'chai';

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxJobExecutionOptions } from "../../src/tx-job-execution-options";
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';
import { TxJobRegistry } from "../../src";

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

  it('tx-job-execute.spec: check running C1-C2-C3 job chain', (done) => {
    logger.info('running: tx-job-execute.spec: check running C1-C2-C3 job chain');

    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    new C1Component();
    new C2Component();
    new C3Component();
    
    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");
        expect(job.current.name).to.equal('GITHUB::GIST::C3');
        expect(persist.read(job.getUuid()).uuid).to.equal(job.getUuid());
        expect(persist.read(job.getUuid()).current).to.equal('GITHUB::GIST::C3');

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

  it('tx-job-continue-spec: check C1-C2-C3 upJSON with execute', (done) => {
    logger.info('running: tx-job-execute.spec: check C1-C2-C3 upJSON with execute');

    new C1Component();
    new C2Component();
    new C3Component();
    let uuid = short().new();
    let executeUuid = short().new();

    let job = new TxJob();
    let from = {
      "name": "GitHub",
      "uuid": uuid,
      "block": "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      "stack": "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      "trace": "",
      "single": false,
      "revert": false,
      "current": "",
      "executeUuid": executeUuid

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

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from C3");
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