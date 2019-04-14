
import createLogger from 'logging';
const logger = createLogger('Job-Continue-Test');

import 'mocha';
import {assert, expect} from 'chai';

import {TxTask, TxSinglePoint } from '../../src/';
import {TxJob} from '../../src';
import { TxJobExecutionId } from '../../src/';
import { TxJobServicesEmptyJSON } from '../../src/tx-job-services-json';
import { TxJobServicesComponent } from '../../src/tx-job-services-component';
import { TxQueuePointRegistry } from '../../src/tx-queuepoint-registry'
import { TxRoutePointRegistry} from '../../src/tx-routepoint-registry'

import { TxConnectorRabbitMQ } from '../connectors/connector-rabbitmq-empty';
import { TxConnectorExpress } from './../connectors/connector-express-empty';

import {S1Component} from './S1.component';
import {S2Component} from './S2.component';
import {S3Component} from './S3.component';
import {E1Component} from './components/E1.component';
import {E2Component} from './components/E2.component';
import {E3Component} from './components/E3.component';

import * as short from 'short-uuid';

TxQueuePointRegistry.instance.setDriver(TxConnectorRabbitMQ);
TxRoutePointRegistry.instance.setDriver(TxConnectorExpress);

new TxJobServicesComponent().init();  

describe('Job Class - Continue', () => {
  try {
    new S1Component();
    new S2Component();
    new S3Component();
  }
  catch (e) {
    console.log("Components are already exist in the registry")
  }

  /**
   */

  it('tx-job-continue-spec: check S1-S2-S3 upJSON with continue', (done) => {
    logger.info('tx-job-continue-spec: check S1-S2-S3 upJSON with continue');
    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    let job = new TxJob('Job-1');
    let from = {
      name: "GitHub",
      uuid: uuid,
      block: "GITHUB::S1,GITHUB::S2,GITHUB::S3",
      stack: "GITHUB::S2,GITHUB::S3",
      trace: "GITHUB::S1",
      single: false,
      revert: false,
      error: false,
      current: "GITHUB::S2",
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
        expect(data['head']['method']).to.equal("from S3");
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
    
    try {
      new E1Component();
      new E2Component();
      new E3Component();
    }
    catch (e) {
      console.log("Components are aleady in the registry");
    }

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
          expect(data['data']['head']['method']).to.equal("from E1");
          expect(data['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        if (count === 2) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E2");
          expect(data['data']['head']['method']).to.equal("from E2");
          expect(data['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        //isOnErrorSubscribed.unsubscribe();
      }
    );
    
    job.continue((new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    ).setReply(new TxSinglePoint('job-1:' + job.uuid).tasks()));

  });

  it('tx-job-continue-spec: check S1-S2-S3 toJSON with continue', (done) => {
    logger.info('tx-job-continue-spec: check S1-S2-S3 toJSON with continue');

    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    let job = new TxJob('Job-1');
    let from = {
      name: "GitHub",
      uuid: uuid,
      block: "GITHUB::S1,GITHUB::S2,GITHUB::S3",
      stack: "GITHUB::S2,GITHUB::S3",
      trace: "GITHUB::S1",
      single: false,
      revert: false,
      error: false,
      current: "GITHUB::S2",
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
        expect(task['head']['method']).to.equal("from S3");
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