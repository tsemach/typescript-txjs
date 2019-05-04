import createLogger from 'logging';
const logger = createLogger('Job-Runner-Test');

import 'mocha';
import {expect} from 'chai';
import * as short from 'short-uuid';

import { TxSubscribe } from './../../src/tx-subscribe';
import { TxTask } from '../../src/tx-task';
import { TxJob } from './../../src/tx-job';

import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { T1Component } from './components/T1.component';
import { T2Component } from './components/T2.component';
import runner from '../../src/tx-job-runner';
import { TimeoutError } from 'rxjs';

describe('Job Runner Class Testing', () => {

new T1Component();
new T2Component();

  /**
   */

  it('tx-job-runner.spec.ts: very simple one job check completed', (done) => {
    logger.info('tx-job-runner.spec.ts: very simple one job check completed')

    let job = new TxJob('Job-1');

    job.add(TxSinglePointRegistry.instance.get('JOB::T1'));
              
    const isCompleted = new TxSubscribe<TxJob>(job);
    
    isCompleted.subscribe(
      (data, job) => {
        logger.info('tx-job-runner.spec: job = ' + job.getName())
        logger.info('tx-job-runner.spec: task = ' + JSON.stringify(data, undefined, 2));
        expect(job.getName()).to.equal('Job-1');
        expect(data['head']['method']).to.equal("from T1");
        expect(data['head']['status']).to.equal("ok");         

        done();
      }
    )          
    runner.execute(
      job, 
      new TxTask({
          method: 'create',
          status: 'start',
          timeout: 0
        },
        {something: 'more data here'}),
      isCompleted
    );

  }).timeout(2000);

  it('tx-job-runner.spec.ts: check two jobs simultaneous', (done) => {
    logger.info('tx-job-runner.spec.ts: check two jobs simultaneous')

    let job1 = new TxJob('Job-1');
    let job2 = new TxJob('Job-2');
    let subject1 = new TxSubscribe<TxJob>(job1);
    let subject2 = new TxSubscribe<TxJob>(job2);
    let finish1 = false;
    let finish2 = false;

    job1.add(TxSinglePointRegistry.instance.get('JOB::T1'));
    job2.add(TxSinglePointRegistry.instance.get('JOB::T2'));

    subject1.subscribe(
      (task, job) => {
        logger.info('tx-job-runner.spec: job = ' + job.getName())
        logger.info('tx-job-runner.spec: task = ' + JSON.stringify(task, undefined, 2));
        expect(job.getName()).to.equal('Job-1');
        expect(task['head']['method']).to.equal("from T1");
        expect(task['head']['status']).to.equal("ok"); 
        subject1.unsubscribe();
        finish1 = true;
        
        if (finish1 && finish2) {
          done();
        }        
      }
    )          

    subject2.subscribe(
      (task, job) => {
        logger.info('tx-job-runner.spec: job = ' + job.getName())
        logger.info('tx-job-runner.spec: task = ' + JSON.stringify(task, undefined, 2));
        expect(job.getName()).to.equal('Job-2');
        expect(task['head']['method']).to.equal("from T2");
        expect(task['head']['status']).to.equal("ok"); 

        subject2.unsubscribe();        
        finish2 = true;

        if (finish1 && finish2) {
          done();
        }        
      }
    )          

    runner.execute(job1, new TxTask({
        method: 'Job-1',
        status: 'start',
        source: 'Job-1',
        timeout: 0
      },
      {something: 'more data here'}),
      subject1
    );

    runner.execute(job2, new TxTask({
        method: 'Job-2',
        status: 'start',
        source: 'Job-2',
        timeout: 0
      },
      {something: 'more data here'}),
      subject2
    );

  }).timeout(2000);

});
