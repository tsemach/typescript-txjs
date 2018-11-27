import createLogger from 'logging';
const logger = createLogger('Job-Undo-Test');

import 'mocha';
import {expect} from 'chai';

import {TxSinglePointRegistry} from '../../src/tx-singlepoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob, TxDirection} from '../../src/tx-job';

import {S1Component} from './S1.component';
import {S2Component} from './S2.component';
import {S3Component} from './S3.component';

describe('Job Class', () => {

  /**
   */

  it('tx-job-step.ts - check job-undo.spec: S1-S2-S3 undo', () => {
    logger.info('tx-job-step.ts - check job-undo.spec: S1-S2-S3 undo');

    new S1Component();
    new S2Component();
    new S3Component();

    let job = new TxJob('Job-1');

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));
    
    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );            
    logger.info("end of first execution");
      
    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-undo-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("undo from S1");  
        expect(data['head']['status']).to.equal("ok");
      }
    );
    job.undo(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}));
  }); 
  
});