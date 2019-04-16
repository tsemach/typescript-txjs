import createLogger from 'logging';
const logger = createLogger('Job-Execute-Error-Test');

import 'mocha';
import {expect} from 'chai';
import {assert} from 'chai';

import { TxJob } from '../../src';
import { TxTask } from '../../src';
import { TxDirection } from '../../src/tx-direction';
import { TxSinglePointRegistry } from '../../src';
import { TxJobExecutionOptions } from '../../src';

import { E1Component } from './components/E1.component';
import { E2Component } from './components/E2.component';
import { E3Component } from './components/E3.component';

import * as short from 'short-uuid';

try {
  new E1Component();
  new E2Component();
  new E3Component();
}
catch (e) {
  console.log("Componets are already exist in the registry")
}

describe('Job Class', () => {
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

  it('tx-job-execute-error-direction.spec: check running error on E1-E2-E3 job chain with default direction (backward)', (done) => {
    logger.info('running: tx-job-execute-error-direction.spec: check running error on E1-E2-E3 job chain with default direction (backward)');

    let count = 0;

    let job = new TxJob('job-1'); // or create through the TxJobRegistry

    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E3'));

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[tx-job-execute-error.spec:data] ERROR: job.getIsCompleted: should not come here when error is occur - data:' + JSON.stringify(data, undefined, 2));
        assert(false);
      },
      async (error) => {
        console.log('[tx-job-execute-error.spec:error] job.getIsCompleted: complete running error all - data:' + JSON.stringify(error, undefined, 2));

        expect(job.error).to.equal(true);
        expect(count).to.equal(3);
      });

    job.getOnError().subscribe(
      (data) => {
        console.log('[tx-job-execute-error-direction.spec:error] job.getOnError: data = ' + JSON.stringify(data, undefined, 2));
        count++;
        if (count === 1) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E3");
          expect(data['data']['head']['method']).to.equal("from E3");
          expect(data['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        if (count === 2) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E2");
          expect(data['data']['head']['method']).to.equal("from E2");
          expect(data['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        if (count === 3) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E1");
          expect(data['data']['head']['method']).to.equal("from E1");
          expect(data['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
          done();
        }
      }
    );

    job.execute(new TxTask({
        method: 'create',
        status: 'backward'
      },
      {something: 'more data here'}
      ),
      {
        error: {direction: TxDirection.backward}
      } as TxJobExecutionOptions
    );
  });

  it('tx-job-execute-error-direction.spec: check running error on E1-E2-E3 job chain with direction forward', (done) => {
    logger.info('running: tx-job-execute-error-direction.spec: check running error on E1-E2-E3 job chain with direction forward');

    let count = 0;

    let job = new TxJob('job-2');

    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E3'));

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[tx-job-execute-error.spec:data] ERROR: job.getIsCompleted: should not come here when error is occur - data:' + JSON.stringify(data, undefined, 2));
        assert(false);
      },
      async (error) => {
        console.log('[tx-job-execute-error.spec:error] job.getIsCompleted: complete running error all - data:' + JSON.stringify(error, undefined, 2));

        expect(job.error).to.equal(true);
        expect(count).to.equal(3);
      });

    job.getOnError().subscribe(
      (data) => {
        console.log('[tx-job-execute-error-direction.spec:error] job.getOnError: data = ' + JSON.stringify(data, undefined, 2));
        count++;
        if (count === 1) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E1");
          expect(data['data']['head']['method']).to.equal("from E1");
          expect(data['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        if (count === 2) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E2");
          expect(data['data']['head']['method']).to.equal("from E2");
          expect(data['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
        }
        if (count === 3) {
          expect(data['head']['name']).to.equal("GITHUB::GIST::E3");
          expect(data['data']['head']['method']).to.equal("from E3");
          expect(data['data']['head']['status']).to.equal("ERROR");
          expect(job.error).to.equal(true);
          done();
        }
      }
    );

    job.execute(new TxTask({
        method: 'create',
        status: 'forward'
      },
      {something: 'more data here'}
      ),
      {
        error: {direction: TxDirection.forward}
      } as TxJobExecutionOptions
    );
  });

});