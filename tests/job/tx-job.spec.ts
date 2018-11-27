import createLogger from 'logging';
import 'mocha';
import {expect} from 'chai';

import {TxJob} from '../../src/tx-job';
import {TxTask} from '../../src/tx-task';
import {TxJobExecutionId} from "../../src";
import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxJobServicesEmptyJSON } from '../../src/tx-job-services-json';
import { TxJobServicesComponent } from '../../src/tx-job-services-component';

import {S1Component} from './S1.component';
import {S2Component} from './S2.component';
import {S3Component} from './S3.component';
import * as short from 'short-uuid';

const logger = createLogger('Job-Test');

new TxJobServicesComponent().init();  

describe('Job Class', () => {

  /**
   */

  it('tx-job.spec.ts: check running S1-S2-S3 job chain', () => {
    logger.info('tx-job.spec.ts: check running S1-S2-S3 job chain')

    new S1Component();
    new S2Component();
    new S3Component();
    
    let job = new TxJob('Job-1'); // or create througth the TxJobRegistry

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-test:execute] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");        
      });                
          
    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
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
    expect(json.current).to.equal('');       
  });

  it('check S1-S2-S3 upJSON with execute', (done) => {
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

  it('check S1-S2-S3 upJSON with continue', () => {

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

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });

  it('check S1-S2-S3 upJSON with continue', () => {
    logger.info('check S1-S2-S3 upJSON with continue')

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

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });
  
  it('tx-job-spec: check job release', () => {
   
    let job = new TxJob('job-1');

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));
    
    job.release();

  });
});