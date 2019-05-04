import createLogger from 'logging';
const logger = createLogger('Job-Execute-GoTo-Simple');

import 'mocha';
import {expect} from 'chai';
import {assert} from 'chai';

import { TxMultiPointRegistry } from './../../src/tx-multipoint-registry';
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';

import { S1GotoComponent } from './components/S1-goto.component';
import { S2GotoComponent } from './components/S2-goto.component';
import { S3GotoComponent } from './components/S3-goto.component';
import { S4GotoComponent } from './components/S4-goto.component';
import { S5GotoComponent } from './components/S5-goto.component';
import { S6GotoComponent } from './components/S6-goto.component';
import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';

describe('Job Class Execute Test', () => {
  try {
    new S1GotoComponent();
    new S2GotoComponent();
    new S3GotoComponent();
    new S4GotoComponent();
    new S5GotoComponent();
    new S6GotoComponent();
  }
  catch (e) {
    console.log('Components is already exist')
  }
    
  /**
   */

  it('tx-job-execute-goto-simple.spec: check running S1-S2-S3 job chain', (done) => {
    logger.info('tx-job-execute-goto-simple.spec: check running S1-S2-S3 job chain');

    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::S1::Goto'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::S2::Goto'));    
    job.add(TxMultiPointRegistry.instance.new('GITHUB::S3-OR-S4', ['GITHUB::S3::Goto', 'GITHUB::S4::Goto']));
    job.add(TxMountPointRegistry.instance.get('GITHUB::S5::Goto'));    
    job.add(TxMountPointRegistry.instance.get('GITHUB::S6::Goto'));

    const expectedTracking = [
      "S1GotoComponent",
      "S2GotoComponent",
      "S4GotoComponent",
      "S5GotoComponent",
      "S6GotoComponent"
    ]

    job.getIsCompleted().subscribe(
      async (data) => {
        console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from S6");
        expect(data['head']['status']).to.equal("ok");
        expect(job.current.name).to.equal('GITHUB::S6::Goto');

        assert.deepEqual(data.getData().tracking, expectedTracking);

        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {
        tracking: new Array<string>()
      })
    );        
  });  

  it('tx-job-execute-goto-simple.spec: check with expicit multipoint running S1-S2-S3 job chain', (done) => {
    logger.info('tx-job-execute-goto-simple.spec: check expicit multipoint  running S1-S2-S3 job chain');

    try {
    TxMultiPointRegistry.instance.create('GITHUB::S3-OR-S4')
      .mountpoint('GITHUB::S3::Goto')
      .mountpoint('GITHUB::S4::Goto');
    }
    catch (e) {     
      console.log('Components is already exist')
    }

    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::S1::Goto'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::S2::Goto'));    
    job.add(TxMountPointRegistry.instance.get('GITHUB::S3-OR-S4'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::S5::Goto'));    
    job.add(TxMountPointRegistry.instance.get('GITHUB::S6::Goto'));

    const expectedTracking = [
      "S1GotoComponent",
      "S2GotoComponent",
      "S4GotoComponent",
      "S5GotoComponent",
      "S6GotoComponent"
    ]

    job.getIsCompleted().subscribe(
      async (data) => {
        console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from S6");
        expect(data['head']['status']).to.equal("ok");
        expect(job.current.name).to.equal('GITHUB::S6::Goto');

        assert.deepEqual(data.getData().tracking, expectedTracking);

        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {
        tracking: new Array<string>()
      })
    );        
  });  

});