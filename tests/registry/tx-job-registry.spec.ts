
//import logger = require('logging');
import createLogger from 'logging';
const logger = createLogger('Registry-Test');
import * as short from 'short-uuid';
const translator = short();

import 'mocha';
import { expect } from 'chai';
import { TxRegistry } from '../../src/tx-registry';
import { TxJobRegistry } from '../../src/tx-job-resgitry';
import { TxJob } from '../../src';

describe('Job Registry Classes - TxJobRegistry', () => {

  before(function() {
    translator.new();
  });
  
  it('check TxJobRegistry - simple get', () => {
    let src = new TxJob('job-1');

    logger.info('going to get job: \'' + src.toJSON().uuid + '\'');
    let dst = TxJobRegistry.instance.get(src.toJSON().uuid);

    expect(dst.getName()).to.equal('job-1');
  });

  it('check TxJobRegistry', () => {


  });

});
