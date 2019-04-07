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
    try {
      new C1Component();
      new C2Component();
      new C3Component();
    }
    catch (e) {
      console.log("Components are already exist in the registry")
    }

    let job = new TxJob('job-1');

    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C3'));
    job.release();
    
    logger.info('checking if job is in TxJobRegistry: ', TxJobRegistry.instance.has(job.getUuid()))
    expect(TxJobRegistry.instance.has(job.getUuid())).to.equal(false);

    let i = 0;
    job.block.forEach(b => {
      logger.info('checking if ', job.block[i].name, ' dataCB is empty: ', b.reply().dataCB)
      expect(b.reply().dataCB.length).to.equal(0);

      logger.info('checking if ', job.block[i].name, ' errorCB is empty: ', b.reply().errorCB)
      expect(b.reply().errorCB.length).to.equal(0);

      logger.info('checking if ', job.block[i].name, ' completeCB is empty: ', b.reply().completeCB)
      expect(b.reply().completeCB.length).to.equal(0);
      
      i++;
    })

    logger.info(`checking that job.executionId = {uuid: '', sequence: 0}`)
    assert.deepEqual(job.executionId, {uuid: '', sequence: 0});

  });
});