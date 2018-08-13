import createLogger from 'logging';
import 'mocha';
import {expect} from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

import {D1Component} from './D1.component';
import {D2Component} from './D2.component';

const logger = createLogger('Job-Test');

describe('Job Class', () => {

  /**
   */

  it('check running decorator D1-D2 job chain', () => {
    
    let D1 = new D1Component();
    let D2 = new D2Component();    
    
    let job = new TxJob(); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::D1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::D2'));
  
    job.execute(new TxTask(
      'decorator',
      '',
      {something: 'decorator more data here'})
    );        

    job.undo(new TxTask(
      'undos',
      '',
      {something: 'undows more data here'}));

    setTimeout(() => { 
      job.getIsCompleted().subscribe(
        (data) => {
          logger('job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
          expect(data).to.equal(1);
        }
      )}, 2000);  
  });

});