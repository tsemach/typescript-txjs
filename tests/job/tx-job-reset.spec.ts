import createLogger from 'logging';
const logger = createLogger('Job-Reset-Test');

import 'mocha';
import {expect} from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';

describe('Job Class', () => {

  it('check job-reset.spec: running C1-C2-C3 job chain', async (done) => {
    
    new C1Component();
    new C2Component();
    new C3Component();
    
    let job = new TxJob('Job-1'); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );            
    logger.info("end of first execution");

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-reset-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");
        done();
      }
    );
    
    job.reset();
    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );            
    logger.info("end of second execution");    
    
  });
});