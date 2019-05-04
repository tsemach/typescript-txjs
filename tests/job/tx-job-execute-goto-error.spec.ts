import createLogger from 'logging';
const logger = createLogger('Job-Execute-GoTo-Error');

import 'mocha';
import {expect} from 'chai';
import {assert} from 'chai';

import { TxMultiPointRegistry } from './../../src/tx-multipoint-registry';
import { TxDirection } from '../../src/tx-direction';
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';

import { S1GotoComponent } from './components/S1-goto.component';
import { S2GotoComponent } from './components/S2-goto.component';
import { S3GotoComponent } from './components/S3-goto.component';
import { S4GotoComponent } from './components/S4-goto.component';
import { S5GotoComponent } from './components/S5-goto.component';
import { S6GotoComponent } from './components/S6-goto.component';
import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxJobExecutionOptions } from '../../src/tx-job-execution-options';

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
    
  beforeEach('tx-job-execute-goto-error.spec - beforeEach: deletting GITHUB::S3-OR-S4', () => {
    TxMultiPointRegistry.instance.del('GITHUB::S3-OR-S4');
  });

  it('tx-job-execute-goto-error.spec: check error running with new S3-or-S4 S1-S2-S3 job chain', (done) => {
    logger.info('tx-job-execute-goto-error.spec: check error running with new S3-or-S4 S1-S2-S3 job chain');

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
      "S4GotoComponent",
      "S2GotoComponent",
      "S1GotoComponent"
    ];

    job.getIsCompleted().subscribe(
      async (data) => {
        console.error('[tx-job-execute-goto-error] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        throw new Error('Should not called to data callback, should be called to error');
      },
      async (error) => {
        console.log('[tx-job-execute-goto-error] job.getIsCompleted: complete running all error tasks - data:' + JSON.stringify(error, undefined, 2));
        expect(error['head']['method']).to.equal("from S1");
        expect(error['head']['status']).to.equal("ERROR");
        expect(job.current.name).to.equal('GITHUB::S1::Goto');
        assert.deepEqual(error.getData().tracking, expectedTracking);
        
        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {
        tracking: new Array<string>(),
        callError: 'GITHUB::S5::Goto'
      })
    );        
  });

  it('tx-job-execute-goto-error.spec: check error running S1-S2-S3 job chain', (done) => {
    logger.info('tx-job-execute-goto-error.spec: check error running S1-S2-S3 job chain');
    
    TxMultiPointRegistry.instance.create('GITHUB::S3-OR-S4')
      .mountpoint('GITHUB::S3::Goto')
      .mountpoint('GITHUB::S4::Goto');    

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
      "S4GotoComponent",
      "S2GotoComponent",
      "S1GotoComponent"
    ];

    job.getIsCompleted().subscribe(
      async (data) => {
        console.error('[tx-job-execute-goto-error] job.getIsCompleted: complete running all tasks  with get S3-or-S4 - data:' + JSON.stringify(data, undefined, 2));
        throw new Error('Should not called to data callback, should be called to error');
      },
      async (error) => {
        console.log('[tx-job-execute-goto-error] job.getIsCompleted: complete running all error with get S3-or-S4 tasks - data:' + JSON.stringify(error, undefined, 2));
        expect(error['head']['method']).to.equal("from S1");
        expect(error['head']['status']).to.equal("ERROR");
        expect(job.current.name).to.equal('GITHUB::S1::Goto');
        assert.deepEqual(error.getData().tracking, expectedTracking);
        
        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {
        tracking: new Array<string>(),
        callError: 'GITHUB::S5::Goto'
      })
    );  
  });

  it('tx-job-execute-goto-error.spec: check error forwarding running S1-S2-S3 job chain', (done) => {
    logger.info('tx-job-execute-goto-error.spec: forwarding check error running S1-S2-S3 job chain');
    
    TxMultiPointRegistry.instance.create('GITHUB::S3-OR-S4')
      .mountpoint('GITHUB::S3::Goto')
      .mountpoint('GITHUB::S4::Goto');    

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
    ];

    job.getIsCompleted().subscribe(
      async (data) => {
        console.error('[tx-job-execute-goto-error] job.getIsCompleted: complete running all tasks forwarding with get S3-or-S4 - data:' + JSON.stringify(data, undefined, 2));
        throw new Error('Should not called to data callback, should be called to error');
      },
      async (error) => {
        console.log('[tx-job-execute-goto-error] job.getIsCompleted: complete running all error with get S3-or-S4 tasks - data:' + JSON.stringify(error, undefined, 2));
        expect(error['head']['method']).to.equal("from S6");
        expect(error['head']['status']).to.equal("ERROR");
        expect(job.current.name).to.equal('GITHUB::S6::Goto');
        assert.deepEqual(error.getData().tracking, expectedTracking);
        
        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {
        tracking: new Array<string>(),
        callError: 'GITHUB::S2::Goto'
      }),
      {
        error: {direction: TxDirection.forward}
      } as TxJobExecutionOptions);  
  });

});