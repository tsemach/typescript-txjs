import createLogger from 'logging';
import 'mocha';
import {expect} from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';

const logger = createLogger('Job-Test');

describe('Job Class', () => {

  /**
   */
  it('check C1-C2-C3 upJSON with step ', (done) => {
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();

    let job = new TxJob();

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
    
    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-step-by-step-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['method']).to.equal("from C3");
        expect(data['status']).to.equal("ok");        
        done();
      });

    job.step(new TxTask(
      'step-1',
      '',
      {something: 'more data here'})
    );
    expect(job.stack.length).to.equal(2);
    
    job.step(new TxTask(
      'step-2',
      '',
      {something: 'more data here'})
    );
    expect(job.stack.length).to.equal(1);

    job.step(new TxTask(
      'step-3',
      '',
      {something: 'more data here'})
    );
    expect(job.stack.length).to.equal(0);    

  });
});