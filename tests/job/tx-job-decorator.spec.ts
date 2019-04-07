import createLogger from 'logging';
const logger = createLogger('Job-Decorator-Test');

import 'mocha';
import {expect} from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

import {D1Component} from './D1.component';
import {D2Component} from './D2.component';

describe('Component Decorator Class', () => {

  /**
   */

  it('tx-job-continue-spec: check job-decorator.spec: running decorator D1-D2 job chain', () => {
    
    try {
      new D1Component();
      new D2Component();    
    }
    catch (e) {
      console.log("Components are already exist in the registry");
    }
    
    let job = new TxJob('Job-1'); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::D1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::D2'));

    let waitfor = {
      method: '[D2Component:tasks] tasks from D1',
      status: 'ok'
    };

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-decorator-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data.get(), undefined, 2));
        expect(waitfor['method']).to.equal(data['head']['method']);
        expect(waitfor['status']).to.equal(data['head']['status']);                
      });


    job.execute(new TxTask({
        method: 'decorator',
        status: ''
      },
      {something: 'decorator more data here'})
    );        

    waitfor = {
      method: '[D1Component:undos] undos from D1',
      status: 'ok'
    };

    job.undo(new TxTask({
        method: 'undos',
        status: ''
      },
      {something: 'undows more data here'}));    
  });

});
