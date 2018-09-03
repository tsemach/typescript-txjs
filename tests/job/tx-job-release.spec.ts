import createLogger from 'logging';
const logger = createLogger('Job-Release-Test');

import 'mocha';
import {expect} from 'chai';
import {assert} from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxJob} from '../../src/tx-job';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';
import {TxTask} from "../../src";

describe('Job Class', () => {

  /**
   */
  it('tx-job-spec: check job release', () => {
    new C1Component();
    new C2Component();
    new C3Component();

    let job = new TxJob('job-1');

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
    job.release();

    // make sure no reply is coming into job.
    job.getOnComponent().subscribe((data) => {
      logger.error(`ERROR: shouldn\'t ${job.getName()} getting any message`);
      expect(0).to.equal(1);
    });

    let MP1 = TxMountPointRegistry.instance.get('GITHUB::GIST::C1');
    MP1.reply().next(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );

  });
});