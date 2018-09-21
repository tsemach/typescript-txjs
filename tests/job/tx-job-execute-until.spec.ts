import createLogger from 'logging';
const logger = createLogger('Job-Execute-Until-Test');

import 'mocha';
import {expect} from 'chai';

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
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
  // let persist = new Persist();
  // TxJobRegistry.instance.driver = persist;

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

  it('tx-job-execute-until.spec: check stopping at C2', (done) => {
    logger.info('running: tx-job-execute-until.spec: check stopping at C2');
    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    new C1Component();
    new C2Component();
    new C3Component();
    
    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    job.getIsStopped().subscribe(
      (data) => {
        logger.info('[job-execute-until-test] job.getIsStopped: run until - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C1");
        expect(data['head']['status']).to.equal("ok");
        logger.info("UUIID " + JSON.stringify(persist.read(job.getUuid()), undefined, 2));
        expect(persist.read(job.getUuid()).uuid).to.equal(job.getUuid());
        expect(persist.read(job.getUuid()).current).to.equal('GITHUB::GIST::C2');
        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}
      ),
      {
        persist: {ison: true},
        execute: {until: 'GITHUB::GIST::C2'}
      } as TxJobExecutionOptions
    );        
  });

  it('tx-job-execute-until.spec: check stopping at C2 with destroy', (done) => {
    logger.info('running: tx-job-execute-until.spec: check stopping at C2 with destroy');
    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    new C1Component();
    new C2Component();
    new C3Component();

    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    job.getIsStopped().subscribe(
      (data) => {
        logger.info('[job-execute-until-test] job.getIsStopped: run until - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C1");
        expect(data['head']['status']).to.equal("ok");
        expect(persist.read(job.getUuid()).uuid).to.equal(job.getUuid());
        expect(persist.read(job.getUuid()).current).to.equal('GITHUB::GIST::C2');
        expect(TxJobRegistry.instance.has(job.getUuid())).to.equal(false);

        done();
      });

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}
      ),
      {
        persist: {ison: true, destroy: true},
        execute: {until: 'GITHUB::GIST::C2'}
      } as TxJobExecutionOptions
    );
  });

  it('tx-job-execute-until-spec: check run until C3 with upJSON', (done) => {
    logger.info('running: tx-job-execute-until-spec: check run until C3 with upJSON');
    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    new C1Component();
    new C2Component();
    new C3Component();

    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    let job = new TxJob('job-2');
    let from = {
      name: "GitHub",
      uuid: uuid,
      block: "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      stack: "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      trace: "",
      single: false,
      revert: false,
      error: false,
      current: "",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence
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

    job.getIsStopped().subscribe(
      (data) => {
        logger.info('[job-execute-until-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C2");
        expect(data['head']['status']).to.equal("ok");
        expect(persist.read(job.getUuid()).uuid).to.equal(job.getUuid());
        expect(persist.read(job.getUuid()).current).to.equal('GITHUB::GIST::C3');
        expect(TxJobRegistry.instance.has(job.getUuid())).to.equal(true);

        done();
      });

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}
      ),
      {
        persist: {ison: true},
        execute: {until: 'GITHUB::GIST::C3'}
      } as TxJobExecutionOptions
    );
    
  });

  it('tx-job-execute-until.spec: check stopping at C2 with destroy then rebuild and continue', (done) => {
    logger.info('running: tx-job-execute-until.spec: check stopping at C2 with destroy then rebuild and continue');
    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    new C1Component();
    new C2Component();
    new C3Component();

    let job1 = new TxJob('job-1'); // or create through the TxJobRegistry

    job1.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job1.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job1.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    job1.getIsStopped().subscribe(
      async (data) => {
        logger.info('[job-execute-until-test] job.getIsStopped: run until - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C1");
        expect(data['head']['status']).to.equal("ok");
        expect(persist.read(job1.getUuid()).uuid).to.equal(job1.getUuid());
        expect(persist.read(job1.getUuid()).current).to.equal('GITHUB::GIST::C2');
        expect(TxJobRegistry.instance.has(job1.getUuid())).to.equal(false);

        let job2 = await TxJobRegistry.instance.rebuild(job1.getUuid());
        job2.getIsCompleted().subscribe(
          (data) => {
            console.log("CONTINUE JOB2 = " + JSON.stringify(data, undefined, 2));

            done();
          });
        job2.continue(new TxTask({
            method: 'continue',
            status: ''
          },
          {something: 'more data here'}));

      });

    job1.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}
      ),
      {
        persist: {ison: true, destroy: true},
        execute: {until: 'GITHUB::GIST::C2'}
      } as TxJobExecutionOptions
    );
  });

});