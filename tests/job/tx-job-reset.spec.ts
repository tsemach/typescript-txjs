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

  it('check running C1-C2-C3 job chain', async () => {
    
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();
    
    let job = new TxJob(); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    job.execute(new TxTask(
      'create',
      '',
      {something: 'more data here'})
    );            
    console.log("end of first execution");
    
    job.reset();
    job.execute(new TxTask(
      'create',
      '',
      {something: 'more data here'})
    );            
    console.log("end of second execution");    

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data).to.equal(3);        
      }
    );
    
  });
});