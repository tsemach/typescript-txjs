import createLogger from 'logging';
const logger = createLogger('Job-Step-Test');

import 'mocha';
import {expect} from 'chai';

import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';

import { S1Component } from './S1.component';
import { S2Component } from './S2.component';
import { S3Component } from './S3.component';
import { Persist } from "./pesist-driver";
import { TxJobRegistry } from "../../src";
import { TxJobExecutionOptions } from "../../src/tx-job-execution-options";

describe('Job Class', () => {
  new S1Component();
  new S2Component();
  new S3Component();
  
  /**
   */
  it('tx-job-step-.ts - check job-step.spec: run S1-S2-S3 with single step', (done) => {
    logger.info('tx-job-step-.ts - check job-step.spec: run S1-S2-s3 with single step');    

    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    let job = new TxJob('Job-1');

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));
    
    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-step-by-step-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from S3");
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

  /**
   */
  it('tx-job-step.ts - check job-step.spec: C1-C2-C3 with single step and persistence', (done) => {
    logger.info('tx-job-step.ts - check job-step.spec: C1-C2-C3 with single step and persistence');

    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    let job = new TxJob('Job-1');

    let MP1 = TxSinglePointRegistry.instance.get('GITHUB::S1');
    let MP2 = TxSinglePointRegistry.instance.get('GITHUB::S2');
    let MP3 = TxSinglePointRegistry.instance.get('GITHUB::S3');

    job.add(MP1);
    job.add(MP2);
    job.add(MP3);

    const isCompletedJobStepSpec1 = job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-step-by-step-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from S3");
        expect(data['head']['status']).to.equal("ok");
        isCompletedJobStepSpec1.unsubscribe();

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
      expect(persist.read(job.getUuid()).current).to.equal('GITHUB::S1');
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
      expect(persist.read(job.getUuid()).current).to.equal('GITHUB::S2');
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
      expect(persist.read(job.getUuid()).current).to.equal('GITHUB::S3');
    }, 400);
  });

  /**
   */
  it('ts-job-step.ts - check job-step.spec: S1-S2-S3 with single step and persistence with isStoped event', (done) => {
    logger.info('ts-job-step.ts - check job-step.spec: S1-S2-S3 with single step and persistence with isStoped event');

    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    let job = new TxJob('job-step-with-stop');

    let MP1 = TxSinglePointRegistry.instance.get('GITHUB::S1');
    let MP2 = TxSinglePointRegistry.instance.get('GITHUB::S2');
    let MP3 = TxSinglePointRegistry.instance.get('GITHUB::S3');

    job.add(MP1);
    job.add(MP2);
    job.add(MP3);

    let checking = ['from S1', 'from S2', 'from S3'];
    let indexing = 0;
    let isCompleted = false;
    let isStopped = false;

    const isCompletedJobStepSpec2 = job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-step-by-step-test-with-stop] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from S3");
        expect(data['head']['status']).to.equal("ok");
        isCompleted = true;
        if (isCompleted && isStopped) {
          isCompletedJobStepSpec2.unsubscribe();

          done();
        }
      });

    const isStoppedJobStepSpec1 = job.getIsStopped().subscribe(
      (data) => {
        logger.info('[job-step-by-step-test-with-stop] job.getIsStopped: complete running step - data:' + JSON.stringify(data, undefined, 2));
        logger.info('[job-step-by-step-test-with-stop] job.getIsStopped: indexing = ' + indexing + ', checking[indexing] = ' + checking[indexing]);
        expect(data['head']['method']).to.equal(checking[indexing]);
        expect(data['head']['status']).to.equal("ok");
        indexing++;

        if (indexing === 3) {
          isStopped = true;
          if (isCompleted && isStopped) {
            isStoppedJobStepSpec1.unsubscribe();
            
            done();
          }
        }
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
      expect(persist.read(job.getUuid()).current).to.equal('GITHUB::S1');
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
      expect(persist.read(job.getUuid()).current).to.equal('GITHUB::S2');
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
      expect(persist.read(job.getUuid()).current).to.equal('GITHUB::S3');
    }, 400);
  });

});