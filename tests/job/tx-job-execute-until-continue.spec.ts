import createLogger from 'logging';
const logger = createLogger('Job-Execute-Until-Continue-Test');

import 'mocha';
import {expect} from 'chai';

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxJobExecutionOptions } from "../../src/tx-job-execution-options";
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';
import { TxJobRegistry } from "../../src";
import { TxJobServicesComponent } from '../../src/tx-job-services-component';

import { C1Component } from './C1.component';
import { C2Component } from './C2.component';
import { C3Component } from './C3.component';
import { Persist } from "./pesist-driver";

import * as short from 'short-uuid';

new TxJobServicesComponent().init();  

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
  it('tx-job-execute-until-continue.spec: check stopping at C2 with destroy then rebuild and continue', (done) => {
    logger.info('running: tx-job-execute-continue-until.spec: check stopping at C2 with destroy then rebuild and continue');
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
        logger.info('[job-execute-until-continue-test] job.getIsStopped: run until - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C1");
        expect(data['head']['status']).to.equal("ok");
        expect(persist.read(job1.getUuid()).uuid).to.equal(job1.getUuid());
        expect(persist.read(job1.getUuid()).current).to.equal('GITHUB::GIST::C2');
        expect(TxJobRegistry.instance.has(job1.getUuid())).to.equal(false);

        let job2 = await TxJobRegistry.instance.rebuild(job1.getUuid());
        job2.getIsCompleted().subscribe(
          (data) => {
            logger.info("[job-2] continue, data = " + JSON.stringify(data, undefined, 2));
            expect(data['head']['method']).to.equal("from C3");
            expect(data['head']['status']).to.equal("ok");
            expect(persist.read(job2.getUuid()).uuid).to.equal(job1.getUuid());
            expect(TxJobRegistry.instance.has(job2.getUuid())).to.equal(true);

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