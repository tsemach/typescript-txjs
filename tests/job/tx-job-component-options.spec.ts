import createLogger from 'logging';
const logger = createLogger('Job-ComponentOptions-Test');

import 'mocha';
import {expect} from 'chai';

import { TxJob } from '../../src/tx-job';
import { TxTask } from '../../src/tx-task';
import { TxSinglePointRegistry } from '../../src';

import { T1Component} from './components/T1.component';
import { T2Component} from './components/T2.component';
import { T3Component} from './components/T3.component';
import { T4Component} from './components/T4.component';
import { T5Component} from './components/T5.component';
import { T6Component} from './components/T6.component';

import * as short from 'short-uuid';
import { TxJobServicesEmptyJSON } from '../../src/tx-job-services-json';
import { deepEqual } from 'assert';
import { TxJobComponentOptions } from '../../src/tx-job-component-options';

describe('Job Class: Test Job Component Options', () => {

  new T1Component();
  new T2Component();
  new T3Component();
  new T4Component();
  new T5Component();
  new T6Component();

  /**
   */

  it('check running T1-T2-T3 while dont wait for T1 and T2' , (done) => {
        
    let job = new TxJob('Job-1'); 

    job.add(TxSinglePointRegistry.instance.get('GITHUB::T1'), {wait: true} as TxJobComponentOptions);
    job.add(TxSinglePointRegistry.instance.get('GITHUB::T2'), {wait: true} as TxJobComponentOptions);
    job.add(TxSinglePointRegistry.instance.get('GITHUB::T3'), {wait: true} as TxJobComponentOptions);

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-test:execute] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from T3");
        expect(data['head']['status']).to.equal("ok");        

        done();
      });                
          
    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );        

  }).timeout(10000);

  it('check running T1-T2-T3-T4-T5-T6 while dont wait for T2 and S3' , (done) => {
        
    let job = new TxJob('Job-1'); 

    job.add(TxSinglePointRegistry.instance.get('GITHUB::T1'), {wait: false} as TxJobComponentOptions);
    job.add(TxSinglePointRegistry.instance.get('GITHUB::T2'), {wait: false} as TxJobComponentOptions);
    job.add(TxSinglePointRegistry.instance.get('GITHUB::T3'), {wait: false} as TxJobComponentOptions);
    job.add(TxSinglePointRegistry.instance.get('GITHUB::T4'), {wait: false} as TxJobComponentOptions);
    job.add(TxSinglePointRegistry.instance.get('GITHUB::T5'), {wait: false} as TxJobComponentOptions);
    job.add(TxSinglePointRegistry.instance.get('GITHUB::T6'), {wait: false} as TxJobComponentOptions);

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-test:execute] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from T6");
        expect(data['head']['status']).to.equal("ok");        

        done();
      });                
          
    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );        

  }).timeout(10000);

  it('check running T1-T2-T3 check all false, T1 is the last one' , (done) => {
        
    let job = new TxJob('Job-1'); 

    job.add(TxSinglePointRegistry.instance.get('GITHUB::T1'), {wait: true} as TxJobComponentOptions);
    job.add(TxSinglePointRegistry.instance.get('GITHUB::T2'), {wait: true} as TxJobComponentOptions);
    job.add(TxSinglePointRegistry.instance.get('GITHUB::T3'), {wait: true} as TxJobComponentOptions);

    job.getOnComponent().subscribe(
      (task) => {
        logger.info('[job-test:execute] job.getOnComponent: task = ' + JSON.stringify(task.get(), undefined, 2));        
      }
    )

    job.getIsCompleted().subscribe(
      (task) => {
        logger.info('[job-test:execute] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(task.get(), undefined, 2));        
        expect(task['head']['method']).to.equal("from T1");
        expect(task['head']['status']).to.equal("ok");        

        setTimeout(() => {
          done();
        }, 3000)
        
      });                
          
    job.execute(new TxTask({
        method: 'begin',
        status: 'ok'
      },
      {something: 'more data here'})
    );        

  }).timeout(10000);

});