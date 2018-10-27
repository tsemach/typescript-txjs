import createLogger from 'logging';
const logger = createLogger('Job-Execute-Test');

import 'mocha';
import {expect} from 'chai';

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxJobExecutionOptions } from "../../src/tx-job-execution-options";
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';
import {TxJobExecutionId, TxJobRegistry} from "../../src";

import { C1Component } from './C1.component';
import { C2Component } from './C2.component';
import { C3Component } from './C3.component';

import * as short from 'short-uuid';

describe('S2S: Job With Service', () => {

  /**
   */

  it('tx-job-execute-service.spec.ts: check running C1-C2-C3 job chain under S2S service', (done) => {
    logger.info('tx-job-execute-service.spec.ts: check running C1-C2-C3 job chain under S2S service');

    new C1Component();
    new C2Component();
    new C3Component();
    
    TxJobRegistry.instance.setServiceName('service-a');
    let job = new TxJob('job-1'); 

    job.on('service-a').add('GITHUB::GIST::C1');
    job.on('service-a').add('GITHUB::GIST::C2');
    job.on('service-a').add('GITHUB::GIST::C3');

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
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