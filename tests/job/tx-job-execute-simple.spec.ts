import createLogger from 'logging';
const logger = createLogger('Job-Execute-Test');

import 'mocha';
import {expect} from 'chai';

import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';

import { S1Component } from './S1.component';
import { S2Component } from './S2.component';
import { S3Component } from './S3.component';

describe('Job Class Execute Test', () => {
  try {
    new S1Component();
    new S2Component();
    new S3Component();
  }
  catch (e) {
    console.log('Components is already exist')
  }
    
  /**
   */

  it('tx-job-execute-simple.spec: check running S1-S2-S3 job chain', (done) => {
    logger.info('tx-job-execute-simple.spec: check running S1-S2-S3 job chain');

    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

    job.getIsCompleted().subscribe(
      async (data) => {
        console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from S3");
        expect(data['head']['status']).to.equal("ok");
        expect(job.current.name).to.equal('GITHUB::S3');

        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}
      )
    );        
  });

});