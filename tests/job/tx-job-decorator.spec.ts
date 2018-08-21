import createLogger from 'logging';
import 'mocha';
import {expect} from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

import {D1Component} from './D1.component';
import {D2Component} from './D2.component';

const logger = createLogger('Job-Decorator-Test');

describe('Component Decorator Class', () => {

  /**
   */

  it('check running decorator D1-D2 job chain', () => {
    
    let D1 = new D1Component();
    let D2 = new D2Component();    
    
    let job = new TxJob(); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::D1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::D2'));

    let waitfor = {
      method: '[D2Component:tasks] tasks from D1',
      status: 'ok'
    };

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-decorator-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(waitfor['method']).to.equal(data['method']);
        expect(waitfor['status']).to.equal(data['status']);                
      });


    job.execute(new TxTask(
      'decorator',
      '',
      {something: 'decorator more data here'})
    );        

    waitfor = {
      method: '[D1Component:undos] undos from D1',
      status: 'ok'
    };

    job.undo(new TxTask(
      'undos',
      '',
      {something: 'undows more data here'}));    
  });

});