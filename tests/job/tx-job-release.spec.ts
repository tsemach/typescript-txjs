import createLogger from 'logging';
const logger = createLogger('Job-Release-Test');

import 'mocha';
import {expect} from 'chai';
import {assert} from 'chai';

import {TxSinglePointRegistry} from '../../src/tx-singlepoint-registry';
import {TxJob} from '../../src/tx-job';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';
import {TxJobRegistry} from "../../src";

describe('Job Class', () => {

  /**
   */
  it('tx-job-spec: check job release', () => {
    new C1Component();
    new C2Component();
    new C3Component();

    let job = new TxJob('job-1');

    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C3'));
    job.release();
    
    logger.info('checking if job is in TxJobRegistry: ', TxJobRegistry.instance.has(job.getUuid()))
    expect(TxJobRegistry.instance.has(job.getUuid())).to.equal(false);

    let i = 0;
    job.block.forEach(b => {
      logger.info('checking if ', job.block[i].name, ' dataCB is null: ', b.reply().dataCB)
      expect(b.reply().dataCB).to.equal(null);

      logger.info('checking if ', job.block[i].name, ' errorCB is null: ', b.reply().errorCB)
      expect(b.reply().errorCB).to.equal(null);

      logger.info('checking if ', job.block[i].name, ' completeCB is null: ', b.reply().completeCB)
      expect(b.reply().completeCB).to.equal(null);
      
      i++;
    })

    logger.info(`checking that job.executionId = {uuid: '', sequence: 0}`)
    assert.deepEqual(job.executionId, {uuid: '', sequence: 0});

  });
});