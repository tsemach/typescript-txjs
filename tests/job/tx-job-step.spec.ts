import createLogger from 'logging';
const logger = createLogger('Job-Step-Test');

import 'mocha';
import {expect} from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';
import {Persist} from "./pesist-driver";
import {TxJobRegistry} from "../../src";
import {TxJobExecutionOptions} from "../../src/tx-job-execution-options";

describe('Job Class', () => {

  /**
   */
  it('check job-step.spec: run C1-C2-C3 with single step ', (done) => {
    new C1Component();
    new C2Component();
    new C3Component();

    let persist = new Persist();
    TxJobRegistry.instance.driver = persist;

    let job = new TxJob();

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
    
    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-step-by-step-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");        
        done();
      });

    job.step(new TxTask({
        method: 'step-1',
        status: ''
      },
      {something: 'more data here'}
      )
    );
    expect(job.stack.length).to.equal(2);

    job.step(new TxTask({
        method: 'step-2',
        status: ''
      },
      {something: 'more data here'}
      )
    );
    expect(job.stack.length).to.equal(1);

    job.step(new TxTask({
        method: 'step-3',
        status: ''
      },
      {something: 'more data here'}
      )
    );
    expect(job.stack.length).to.equal(0);
  });

  it('check job-step.spec: C1-C2-C3 with single step and persistence', (done) => {
    new C1Component();
    new C2Component();
    new C3Component();

    let persist = new Persist();
    TxJobRegistry.instance.driver = persist;

    let job = new TxJob();

    let MP1 = TxMountPointRegistry.instance.get('GITHUB::GIST::C1');
    let MP2 = TxMountPointRegistry.instance.get('GITHUB::GIST::C2');
    let MP3 = TxMountPointRegistry.instance.get('GITHUB::GIST::C3');

    job.add(MP1);
    job.add(MP2);
    job.add(MP3);

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-step-by-step-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");
        done();
      });

    setTimeout(() => {
      job.step(new TxTask({
          method: 'step-1',
          status: ''
        },
        {something: 'more data here'}
        ),
        {
          persist: {ison: true}
        } as TxJobExecutionOptions
      );
      expect(job.stack.length).to.equal(2);
      expect(persist.read(job.getUuid()).uuid).to.equal(job.getUuid());
      expect(persist.read(job.getUuid()).current).to.equal('GITHUB::GIST::C1');
    }, 0);

    setTimeout(() => {
      job.step(new TxTask({
          method: 'step-2',
          status: ''
        },
        {something: 'more data here'}
        ),
        {
          persist: {ison: true}
        } as TxJobExecutionOptions
      );
      expect(job.stack.length).to.equal(1);
      expect(persist.read(job.getUuid()).uuid).to.equal(job.getUuid());
      expect(persist.read(job.getUuid()).current).to.equal('GITHUB::GIST::C2');
    }, 200);

    setTimeout(() => {
      job.step(new TxTask({
          method: 'step-3',
          status: ''
        },
        {something: 'more data here'}
        ),
        {
          persist: {ison: true}
        } as TxJobExecutionOptions

      );
      expect(job.stack.length).to.equal(0);
      expect(persist.read(job.getUuid()).uuid).to.equal(job.getUuid());
      expect(persist.read(job.getUuid()).current).to.equal('GITHUB::GIST::C3');
    }, 400);
  });

});