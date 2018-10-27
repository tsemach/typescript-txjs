import createLogger from 'logging';
const logger = createLogger('Job-Execute-Error-Test');

import 'mocha';
import {expect} from 'chai';
import {assert} from 'chai';

import { TxMountPointRegistry } from '../../src';
import { TxJobExecutionOptions } from '../../src';
import { TxTask } from '../../src';
import { TxJob } from '../../src';
import {TxJobExecutionId, TxJobRegistry} from "../../src";
import { TxJobServicesComponent } from '../../src/tx-job-services-component';
import { TxJobServicesEmptyJSON } from '../../src/tx-job-services-json';

import { E1Component } from './E1.component';
import { E2Component } from './E2.component';
import { E3Component } from './E3.component';
import { Persist } from "./pesist-driver";

import * as short from 'short-uuid';

new TxJobServicesComponent().init();  

describe('Job Class', () => {
  let persist = new Persist();
  TxJobRegistry.instance.setPersistDriver(persist);

  let a = 0;
  before(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        a = 1;
        resolve();
      }, 200);
    });
  });

  /**
   */

  it('tx-job-execute-error.spec: check running error on E1-E2-E3 job chain', async () => {
    logger.info('running: tx-job-execute-error.spec: check running error on E1-E2-E3 job chain');

    let count = 0;
    let persist = new Persist();
    TxJobRegistry.instance.setPersistDriver(persist);

    new E1Component();
    new E2Component();
    new E3Component();

    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::E1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::E2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::E3'));

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[tx-job-execute-error.spec:data] ERROR: job.getIsCompleted: should not come here when error is occur - data:' + JSON.stringify(data, undefined, 2));
        assert(false);
      },
      (error) => {
        console.log('[tx-job-execute-error.spec:error] job.getIsCompleted: complete running error all - data:' + JSON.stringify(error, undefined, 2));

        expect(persist.read(job.getUuid()).uuid).to.equal(job.getUuid());
        expect(persist.read(job.getUuid()).current).to.equal('GITHUB::GIST::E1');
        expect(job.error).to.equal(true);
        expect(count).to.equal(3);
      });

    job.getOnError().subscribe(
      (data) => {
        console.log('[tx-job-execute-error.spec:error] job.getOnError: data = ' + JSON.stringify(data, undefined, 2));
        count++;
        if (count === 1) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E3");
          expect(data['data']['data']['head']['method']).to.equal("from E3");
          expect(data['data']['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        if (count === 2) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E2");
          expect(data['data']['data']['head']['method']).to.equal("from E2");
          expect(data['data']['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        if (count === 3) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E1");
          expect(data['data']['data']['head']['method']).to.equal("from E1");
          expect(data['data']['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
      }
    );

    job.execute(new TxTask({
        method: 'create',
        status: 'start'
      },
      {something: 'more data here'}
      ),
      {
        persist: {ison: true}
      } as TxJobExecutionOptions
    );
  });

  it('[tx-job-execute-error.spec:error]: check error on E1-E2-E3 upJSON with execute', async () => {
    logger.info('[tx-job-execute-error.spec:error]: check on E1-E2-E3 upJSON with execute');

    new E1Component();
    new E2Component();
    new E3Component();

    let count = 3;
    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    let job = new TxJob('Job-1');
    let from = {
      name: "Job-GitHub-API",
      uuid: uuid,
      block: "GITHUB::GIST::E1,GITHUB::GIST::E2,GITHUB::GIST::E3",
      stack: "GITHUB::GIST::E2,GITHUB::GIST::E3",
      trace: "GITHUB::GIST::E1",
      error: true,
      single: false,
      revert: false,
      current: "GITHUB::GIST::E2",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence,
      services: TxJobServicesEmptyJSON
    };
    let after = job.upJSON(from).toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.uuid).to.equal(after['uuid']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.single).to.equal(after['single']);
    expect(from.error).to.equal(after['error']);
    expect(from.block).to.equal(after['block']);
    expect(from.current).to.equal(after['current']);
    expect(from.executeUuid).to.equal(after['executeUuid']);
    expect(from.sequence).to.equal(after['sequence']);

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[tx-job-execute-error.spec:upjson:data] ERROR: job.getIsCompleted: should not come here when error is occur - data:' + JSON.stringify(data, undefined, 2));
        assert(false);
      },
      (error) => {
        console.log('[tx-job-execute-error.spec:upjson:error] job.getIsCompleted: complete running error all - data:' + JSON.stringify(error, undefined, 2));

        expect(job.error).to.equal(true);
        expect(job.getCurrentName()).to.be.equal('GITHUB::GIST::E1');
        expect(count).to.equal(1);
      });

    job.getOnError().subscribe(
      (data) => {
        console.log('[tx-job-execute-error.spec:upjson:error] job.getOnError: data = ' + JSON.stringify(data, undefined, 2));
        count--;
        console.log('[tx-job-execute-error.spec:upjson:error] count = ' + count);

        if (count === 1) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E1");
          expect(data['data']['data']['head']['method']).to.equal("from E1");
          expect(data['data']['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        if (count === 2) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E2");
          expect(data['data']['data']['head']['method']).to.equal("from E2");
          expect(data['data']['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        // if (count === 3) {
        //   expect(data['head']['name']).to.equal("GITHUB::GIST::E1");
        //   expect(data['data']['data']['head']['method']).to.equal("from E1");
        //   expect(data['data']['data']['head']['status']).to.equal("ERROR");
        //   expect(job.error).to.equal(true);
        // }
      }
    );

    job.execute(new TxTask({
        method: 'create',
        status: 'start'
      },
      {something: 'more data here'}
      ),
      {
        persist: {ison: true}
      } as TxJobExecutionOptions
    );

  });

});