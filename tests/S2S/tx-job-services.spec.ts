
import createLogger from 'logging';
const logger = createLogger('Job-Services-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import { TxJobServices } from '../../src/tx-job-services';
import { TxJob } from '../../src/tx-job';
import { C1Component } from './C1.component';
import { C2Component } from './C2.component';
import { C3Component } from './C3.component';

describe('Job Service Class - on | add', () => {
  /**
   */

  it('tx-job-services.spec.ts: test job services utilty class on | add', () => {
    logger.info('tx-job-services.spec.ts: test job services utilty class on | add');
    
    new C1Component();
    new C2Component();
    new C3Component();

    let services = new TxJobServices(new TxJob('Job-1'));
    
    services.on('service-a').add('GITHUB::GIST::C1');
    services.on('service-a').add('GITHUB::GIST::C2');
    services.on('service-a').add('GITHUB::GIST::C3');

    services.on('service-b').add('GITHUB::GIST::C1');
    services.on('service-b').add('GITHUB::GIST::C2');
    services.on('service-b').add('GITHUB::GIST::C3');

    services.on('service-c').add('GITHUB::GIST::C1');
    services.on('service-c').add('GITHUB::GIST::C2');
    services.on('service-c').add('GITHUB::GIST::C3');

    logger.info('service-a = ' + JSON.stringify(services.getNames('service-a')));
    logger.info('service-b = ' + JSON.stringify(services.getNames('service-b')));
    logger.info('service-c = ' + JSON.stringify(services.getNames('service-c')));

    assert.deepEqual(["GITHUB::GIST::C1","GITHUB::GIST::C2","GITHUB::GIST::C3"], services.getNames('service-a'), 'check service-a name list');
    assert.deepEqual(["GITHUB::GIST::C1","GITHUB::GIST::C2","GITHUB::GIST::C3"], services.getNames('service-b'), 'check service-b name list');
    assert.deepEqual(["GITHUB::GIST::C1","GITHUB::GIST::C2","GITHUB::GIST::C3"], services.getNames('service-c'), 'check service-c name list');
  });  

  it('tx-job-services.spec.ts: test job services check adding not exist mountpoint', () => {
    logger.info('tx-job-services.spec.ts: test job services check adding not exist mountpoint');
        
    let services = new TxJobServices(new TxJob('Job-1'));
    
    try {      
      services.on('service-a').add('GITHUB::GIST::C4');      
      logger.error("ERROR: should not reach to this point, adding GITHUB::GIST::C4 should rais an execption"); 
      assert.notOk('ERROR: adding GITHUB::GIST::C4 should rais an execption');
    }
    catch (e) {
       logger.info("catch execption when adding GITHUB::GIST::C4 as expected"); 
    }
    
  });  
        
});
  