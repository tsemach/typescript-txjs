import createLogger from 'logging';
const logger = createLogger('Job-SinglePoint-Test');

import 'mocha';
import {expect} from 'chai';

import { TxJob } from '../../src/tx-job';
import { TxTask } from '../../src/tx-task';
import { TxSinglePointRegistry, TxJobExecutionId } from '../../src';

import { S1Component} from './S1.component';
import { S2Component} from './S2.component';
import { S3Component} from './S3.component';
import * as short from 'short-uuid';
import { TxJobServicesEmptyJSON } from '../../src/tx-job-services-json';
import { deepEqual } from 'assert';

//new TxJobServicesComponent().init();  

describe('Job Class: Test with TxSinglePoint', () => {

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

  it('check running S1-S2-S3 single job chain', () => {
        
    let job = new TxJob('Job-1'); 

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-test:execute] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from S3");
        expect(data['head']['status']).to.equal("ok");        
      });                
          
    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );        

  });

  it('check running S1-S2-S3 with two jobs simultaneous', (done) => {
      
    let job_1_done = false;
    let job_2_done = false;

    let job_1 = new TxJob('Job-1'); 

    job_1.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job_1.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job_1.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

    job_1.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-1-test:execute] job_1.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data.get(), undefined, 2));
        expect(data['head']['method']).to.equal("from S3");
        expect(data['data']['source']).to.equal("job_1");
        expect(data['head']['status']).to.equal("ok");

        job_1_done = true;
        if (job_1_done && job_2_done) {
          done();
        }

      });                
          
    let job_2 = new TxJob('Job-2'); 

    job_2.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job_2.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job_2.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

    job_2.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-2-test:execute] job_2.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data.get(), undefined, 2));
        expect(data['head']['method']).to.equal("from S3");
        expect(data['data']['source']).to.equal("job_2");
        expect(data['head']['status']).to.equal("ok");

        job_2_done = true;
        if (job_1_done && job_2_done) {
          done();
        }
      });                

    job_1.execute(new TxTask({
        method: 'create',                
        status: ''        
      },
      {something: 'from job_1 - more data here', source: 'job_1'})
    );        

    job_2.execute(new TxTask({
        method: 'create',                
        status: ''        
      },
      {something: 'from job_2 - more data here', source: 'job_2'})
    );        

  });

  it('check S1-S2-S3 toJSON begining', () => {

    let job = new TxJob('GitHub'); // or create througth the TxJobRegistry

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

    console.log('toJSON = ' + JSON.stringify(job.toJSON(), undefined, 2));

    let json = job.toJSON();

    expect(json.name).to.equal('GitHub');
    expect(json.stack).to.equal('GITHUB::S1,GITHUB::S2,GITHUB::S3');
    expect(json.block).to.equal("GITHUB::S1,GITHUB::S2,GITHUB::S3");
    expect(json.trace).to.equal('');
    expect(json.single).to.equal(false);
    expect(json.current).to.equal('');       
  });

  it('ts-job-singlepoint.ts - check S1-S2-S3 upJSON with execute', (done) => {  
    logger.info('ts-job-singlepoint.ts - check S1-S2-S3 upJSON with execute');

    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    let job = new TxJob('Job-1');
    let from = {
      name: "GitHub",
      uuid: uuid,
      block: "GITHUB::S1,GITHUB::S2,GITHUB::S3",
      stack: "GITHUB::S1,GITHUB::S2,GITHUB::S3",
      trace: "",
      single: false,
      revert: false,
      error: false,
      current: "",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence,
      services: TxJobServicesEmptyJSON

    };
    let after = job.upJSON(from).toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.single).to.equal(after['single']);
    expect(from.block).to.equal(after['block']);
    expect(from.current).to.equal(after['current']);
    expect(from.executeUuid).to.equal(after['executeUuid']);
    expect(from.sequence).to.equal(after['sequence']);

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-test:upJSON] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from S3");
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

  it('ts-job-singlepoint.ts - check S1-S2-S3 upJSON-toJSON with continue', (done) => {
    logger.info('ts-job-singlepoint.ts - check S1-S2-S3 upJSON with continue');

    let uuid = short().new();
    let executionId = {uuid: short().new(), sequence: 1};

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
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);
    expect(from.executeUuid).to.equal(after['executeUuid']);
    expect(from.sequence).to.equal(after['sequence']);

    let expected = {
      head: {
        method: "from S3",
        status: "ok"
      },
      data: {
        something: "more data here"
     }
    }

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info("[tx-job-singlepoint:continue-upJSON-toJSON] job completed, data = " + JSON.stringify(data.get(), undefined, 2));
        deepEqual(expected, data.get());

        done();
      }
    );

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });

  it('ts-job-singlepoint.ts - check S1-S2-S3 upJSON with continue', (done) => {
    logger.info('ts-job-singlepoint.ts - check S1-S2-S3 upJSON with continue');

    let uuid = short().new();
    let executionId = {uuid: short().new(), sequence: 1};

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

    console.log('job = ' + JSON.stringify(job.toJSON(), undefined, 2));
    let after = job.toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);
    expect(from.executeUuid).to.equal(after['executeUuid']);
    expect(from.sequence).to.equal(after['sequence']);

    let expected = {
      head: {
        method: "from S3",
        status: "ok"
      },
      data: {
        something: "more data here"
      }
    }

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info("[tx-job-singlepoint:continue-upJSON] job completed, data = " + JSON.stringify(data.get(), undefined, 2));
        deepEqual(expected, data.get());

        done();
      }
    );

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });
  
});