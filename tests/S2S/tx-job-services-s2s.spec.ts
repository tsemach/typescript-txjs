
import createLogger from 'logging';
const logger = createLogger('Job-Services-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import { TxJobServicesComponent } from '../../src/tx-job-services-component';
import { TxJob } from '../../src/tx-job';
import { C1Component } from './C1.component';
import { C2Component } from './C2.component';
import { C3Component } from './C3.component';
import { TxMountPointRegistry, TxJobRegistry, TxTask, TxJobExecutionOptions, TxJobExecutionId } from '../../src';

//TxJobRegistry.instance.setServiceName('service-c');
//new TxJobServicesComponent().init();

describe('S2S: Cross Service Jobs', () => {

  TxMountPointRegistry.instance.create('GITHUB::GIST::A1');
  TxMountPointRegistry.instance.create('GITHUB::GIST::A2');
  TxMountPointRegistry.instance.create('GITHUB::GIST::A3');

  TxMountPointRegistry.instance.create('GITHUB::GIST::B1');
  TxMountPointRegistry.instance.create('GITHUB::GIST::B2');
  TxMountPointRegistry.instance.create('GITHUB::GIST::B3');

  new C1Component();
  new C2Component();
  new C3Component();

  /**
   */

  it('tx-job-services-s2s.spec.ts: check running S2S (cross services job)', async (done) => {
    logger.info('tx-job-services-s2s.spec.ts: check running S2S (cross services job)');
    
    TxJobRegistry.instance.setServiceName('service-c');
    await new TxJobServicesComponent().init();  

    let job = new TxJob('job-1'); 

    job.on('service-c').add('GITHUB::GIST::C1');
    job.on('service-c').add('GITHUB::GIST::C2');
    job.on('service-c').add('GITHUB::GIST::C3');

    job.on('service-a').add('GITHUB::GIST::A1');
    job.on('service-a').add('GITHUB::GIST::A2');
    job.on('service-a').add('GITHUB::GIST::A3');

    job.on('service-b').add('GITHUB::GIST::B1');
    job.on('service-b').add('GITHUB::GIST::B2');
    job.on('service-b').add('GITHUB::GIST::B3');

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[job-services-s2s-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");
        expect(job.current.name).to.equal('GITHUB::GIST::C3');

        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: 'start'
      },
      {something: 'more data here'}
      ),
      {
        execute: {source: 'service'}
      } as TxJobExecutionOptions
    );        
  }).timeout(2000);

});  