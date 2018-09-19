import createLogger from 'logging';
const logger = createLogger('Job-Execute-Record-Test');

import 'mocha';
import {expect} from 'chai';

import { TxMountPointRegistry } from '../../src';
import { TxJobExecutionOptions } from "../../src";
import { TxRecordPersistMemory } from "../../src";
import { TxTask } from '../../src';
import { TxJob } from '../../src';
import { TxJobRegistry } from "../../src";

import { C1Component } from './C1.component';
import { C2Component } from './C2.component';
import { C3Component } from './C3.component';

describe('Job Execute Recording', () => {
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
  it('tx-job-execute-record-record.spec: check record execution with TxRecordPersistMemory', (done) => {
    logger.info('running: tx-job-execute-record.spec: record execution with TxRecordPersistMemory');

    let recorder = new TxRecordPersistMemory();
    TxJobRegistry.instance.setRecorderDriver(recorder);

    new C1Component();
    new C2Component();
    new C3Component();
    
    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    job.getIsCompleted().subscribe(
    (data) => {
      console.log('[tx-job-execute-record] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
      expect(data['head']['method']).to.equal("from C3");
      expect(data['head']['status']).to.equal("ok");
      expect(job.current.name).to.equal('GITHUB::GIST::C3');

      console.log("RECORS TEST: BEFOR EDUMP")
      recorder.dump();

      done();
    });

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}
      ),
      {
        persist: {ison: false},
        execute: {record: true}
      } as TxJobExecutionOptions
    );        
  });

  it('tx-job-execute-record-record.spec: check record execution with TxRecordPersistMongoDB', (done) => {
    logger.info('running: tx-job-execute-record.spec: record execution with TxRecordPersistMongoDB');

    let recorder = new TxRecordPersistMemory();
    TxJobRegistry.instance.setRecorderDriver(recorder);

    new C1Component();
    new C2Component();
    new C3Component();

    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[tx-job-execute-record] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");
        expect(job.current.name).to.equal('GITHUB::GIST::C3');
        console.log("RECORS TEST: BEFOR EDUMP")
        recorder.dump();
        done();
      });

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}
      ),
      {
        persist: {ison: false},
        execute: {record: true}
      } as TxJobExecutionOptions
    );
  });

});