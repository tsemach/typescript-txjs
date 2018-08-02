
import createLogger from 'logging'; 
const logger = createLogger('Job-Test');

import 'mocha';
import { expect } from 'chai';

import { TxMountPointRegistry } from '../src/tx-mountpoint-registry';
import { TxTask } from '../src/tx-task';
import { TxJob } from '../src/tx-job';

import { C1Component } from './C1.component';
import { C2Component } from './C2.component';
import { C3Component } from './C3.component';

describe('Job Class', () => {

  /**
   */

  it('run C1-C2-C3 job chain', () => {
    
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
        
    //expect(C1.getReply()).to.equal(JSON.stringify(task));
  });

});