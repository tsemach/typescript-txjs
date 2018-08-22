import createLogger from 'logging';
import 'mocha';
import {expect} from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob, TxDirection} from '../../src/tx-job';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';

const logger = createLogger('Job-Test');

describe('Job Class', () => {

  /**
   */

  it('check C1-C2-C3 undo ', () => {
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();

    let job = new TxJob();

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
    
    job.execute(new TxTask(
      'create',
      '',
      {something: 'more data here'})
    );            
    logger.info("end of first execution");
      
    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-undo-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['method']).to.equal("undo from C1");  
        expect(data['status']).to.equal("ok");
      }
    );
    job.undo(new TxTask(
      'create',
      '',
      {something: 'more data here'}));
  }); 
});