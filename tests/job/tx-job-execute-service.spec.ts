import createLogger from 'logging';
const logger = createLogger('Job-Execute-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

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

  TxMountPointRegistry.instance.create('GITHUB::GIST::A1');
  TxMountPointRegistry.instance.create('GITHUB::GIST::A2');
  TxMountPointRegistry.instance.create('GITHUB::GIST::A3');

  TxMountPointRegistry.instance.create('GITHUB::GIST::B1');
  TxMountPointRegistry.instance.create('GITHUB::GIST::B2');
  TxMountPointRegistry.instance.create('GITHUB::GIST::B3');

  // TxMountPointRegistry.instance.create('GITHUB::GIST::C1');
  // TxMountPointRegistry.instance.create('GITHUB::GIST::C2');
  // TxMountPointRegistry.instance.create('GITHUB::GIST::C3');

  new C1Component();
  new C2Component();
  new C3Component();

  const JobServices = {
    "stack": [ "service-a", "service-b", "service-c" ],
    "trace": [],
    "block": [ "service-a", "service-b", "service-c" ],
    "current": "",
    "jobs": [ 
      {
        "service": "service-a",
        "components": [ "GITHUB::GIST::A1", "GITHUB::GIST::A2", "GITHUB::GIST::A3" ]
      },
      {
        "service": "service-b",
        "components": [ "GITHUB::GIST::B1", "GITHUB::GIST::B2", "GITHUB::GIST::B3" ]
      },
      {
        "service": "service-c",
        "components": [ "GITHUB::GIST::C1", "GITHUB::GIST::C2", "GITHUB::GIST::C3" ]
      }
    ]
  }

  /**
   */
  it('tx-job-execute-service.spec.ts: check running C1-C2-C3 job chain under S2S service', (done) => {
    logger.info('tx-job-execute-service.spec.ts: check running C1-C2-C3 job chain under S2S service');
    
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

  it('check job-serialize.spec.ts: check Job Services serialization toJSON | upJSON with services', (done) => {
    logger.info('tx-job-serialize.spec.ts: check Job Services serialization toJSON | upJSON with services');
    TxJobRegistry.instance.setServiceName('service-c');

    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    /**
     * load job where GITHUB_GIST_C1 is already called so need to continue from GITHUB_GIST_C2
     * @type {TxJob}
     */
    let job = new TxJob();
    let from = {
      name: 'GITHUB',
      uuid: uuid,
      block: "",
      stack: "",
      trace: "",
      single: false,
      revert: false,
      error: false,
      current: "",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence,
      services: JobServices
    };

    let after = job.upJSON(from).toJSON();
    console.log('[upJSON] after = ' + JSON.stringify(after, undefined, 2));

    assert.deepEqual(JobServices, after.services);   
    assert.deepEqual(from, after); 

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
  });

});