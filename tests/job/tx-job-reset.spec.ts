import createLogger from 'logging';
const logger = createLogger('Job-Reset-Test');

import 'mocha';
import {expect} from 'chai';

import {TxSinglePointRegistry} from '../../src/tx-singlepoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';

describe('Job Class', () => {

  it('check job-reset.spec: running C1-C2-C3 job chain', async (done) => {
    
   try {
      new C1Component();
      new C2Component();
      new C3Component();
    }
    catch (e) {
      console.log("Components are already exist in the registry")
    }
    
    let job = new TxJob('Job-1'); // or create througth the TxJobRegistry

    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C3'));

    job.getIsCompleted().subscribe(
      (data) => {        
        logger.info("end of first execution");

        job.reset();        
        job.getIsCompleted().subscribe(
          (task) => {
            logger.info("end of second execution");

            logger.info('[job-reset-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(task.get(), undefined, 2));
            expect(task['head']['method']).to.equal("from C3");
            expect(task['head']['status']).to.equal("ok");

            done();
          }
        )

        job.execute(new TxTask({
            method: 'create',
            status: ''
          },
          {something: 'more data here'})
        );            
      }
    );

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );            
        
  });
});