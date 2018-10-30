import createLogger from 'logging';
const logger = createLogger('Job-Continue-Test');

import 'mocha';
import {assert, expect} from 'chai';

import {TxTask} from '../../src/';
import {TxJob} from '../../src';
import { TxJobExecutionId } from '../../src/';
import { TxJobServicesEmptyJSON } from '../../src/tx-job-services-json';
import { TxJobServicesComponent } from '../../src/tx-job-services-component';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';
import {E1Component} from './E1.component';
import {E2Component} from './E2.component';
import {E3Component} from './E3.component';

import * as short from 'short-uuid';

new TxJobServicesComponent().init();  

describe('Job Class - Continue', () => {

  /**
   */

  it('tx-job-continue-spec: check C1-C2-C3 upJSON with continue', (done) => {
    logger.info('tx-job-continue-spec: check C1-C2-C3 upJSON with continue');
    new C1Component();
    new C2Component();
    new C3Component();
    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    let job = new TxJob('Job-1');
    let from = {
      name: "GitHub",
      uuid: uuid,
      block: "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      stack: "GITHUB::GIST::C2,GITHUB::GIST::C3",
      trace: "GITHUB::GIST::C1",
      single: false,
      revert: false,
      error: false,
      current: "GITHUB::GIST::C2",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence,
      services: TxJobServicesEmptyJSON
    };
    let after = job.upJSON(from).toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.uuid).to.equal(after['uuid']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);
    expect(from.executeUuid).to.equal(after['executeUuid']);
    expect(from.sequence).to.equal(after['sequence']);

    const isCompletedSubscribed1 = job.getIsCompleted().subscribe(
      (data) => {
        logger.debug('[job-continue-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");
        isCompletedSubscribed1.unsubscribe();

        done();
      });                

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });

  it('tx-job-continue-spec:error check continue error on E1-E2-E3 upJSON with continue', async () => {
    logger.info('tx-job-continue-spec:error check error on E1-E2-E3 upJSON with continue');
    new E1Component();
    new E2Component();
    new E3Component();
    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    let count = 3;
    let job = new TxJob('Job-1');
    let from = {
      name: "GitHub",
      uuid: uuid,
      block: "GITHUB::GIST::E1,GITHUB::GIST::E2,GITHUB::GIST::E3",
      stack: "GITHUB::GIST::E2,GITHUB::GIST::E3",
      trace: "GITHUB::GIST::E1",
      single: false,
      revert: false,
      error: true,
      current: "GITHUB::GIST::E2",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence,
      services: TxJobServicesEmptyJSON
    };
    let after = job.upJSON(from).toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.uuid).to.equal(after['uuid']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);
    expect(from.executeUuid).to.equal(after['executeUuid']);
    expect(from.sequence).to.equal(after['sequence']);

    const isCompletedSubscribed2 = job.getIsCompleted().subscribe(
      (data) => {
        console.log('[tx-job-continue-spec.spec:upjson:data] ERROR: job.getIsCompleted: should not come here when error is occur - data:' + JSON.stringify(data, undefined, 2));
        assert(false);
        isCompletedSubscribed2.unsubscribe();
      },
      (error) => {
        console.log('[tx-job-continue-spec.spec:upjson:error] job.getIsCompleted: complete running error all - data:' + JSON.stringify(error, undefined, 2));

        expect(job.error).to.equal(true);
        expect(job.getCurrentName()).to.be.equal('GITHUB::GIST::E1');
        expect(count).to.equal(1);
        isCompletedSubscribed2.unsubscribe();        
      });

    job.getOnError().subscribe(
      (data) => {
        console.log('[tx-job-continue-spec.spec:upjson:error] job.getOnError: data = ' + JSON.stringify(data, undefined, 2));
        count--;
        console.log('[tx-job-continue-spec.spec:upjson:error] count = ' + count);

        if (count === 1) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E1");
          expect(data['data']['data']['head']['method']).to.equal("from E1");
          expect(data['data']['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        if (count === 2) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E2");
          expect(data['data']['data']['head']['method']).to.equal("from E2");
          expect(data['data']['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        //isOnErrorSubscribed.unsubscribe();
      }
    );

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );

  });

  it('tx-job-continue-spec: check C1-C2-C3 toJSON with continue', (done) => {
    logger.info('tx-job-continue-spec: check C1-C2-C3 toJSON with continue');
    new C1Component();
    new C2Component();
    new C3Component();
    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    let job = new TxJob('Job-1');
    let from = {
      name: "GitHub",
      uuid: uuid,
      block: "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      stack: "GITHUB::GIST::C2,GITHUB::GIST::C3",
      trace: "GITHUB::GIST::C1",
      single: false,
      revert: false,
      error: false,
      current: "GITHUB::GIST::C2",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence,
      services: TxJobServicesEmptyJSON
    };
    job.upJSON(from);

    logger.info('job = ' + JSON.stringify(job.toJSON(), undefined, 2));
    let after = job.toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.uuid).to.equal(after['uuid']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);
    expect(from.executeUuid).to.equal(after['executeUuid']);
    expect(from.sequence).to.equal(after['sequence']);

    interface Head {
      method: string;
      status: string;
    }

    const subscribed = job.getIsCompleted().subscribe(
      (task) => {        
        logger.info('[job-continue-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(task, undefined, 2));        
        expect(task['head']['method']).to.equal("from C3");
        expect(task['head']['status']).to.equal("ok");
        subscribed.unsubscribe();
        done();
      });                

    job.continue(new TxTask<Head>({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });

});