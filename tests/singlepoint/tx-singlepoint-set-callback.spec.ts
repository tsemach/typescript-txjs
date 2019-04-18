
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Method-Test');

import 'mocha';
import { expect, assert } from 'chai';
import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxTask } from '../../src/tx-task';

describe('Mount Point Class', () => {

  it('tx-singlepoint-set-callback.spec: check mountpoint methods callback', (done) => {
    logger.info('tx-singlepoint-set-callback.spec: check mountpoint methods callback');

    let whatIsCalled = 0;
    class C1Component {      
      private singlepoint = TxSinglePointRegistry.instance.create('GITHUB::GISTP::C1');    

      constructor() {
        logger.info("C1Component:con't is called, no need to subscribe, the method will take care of it");            
        this.singlepoint.tasks().setCallbacks(this.doit, this.error)        
      }
      
      doit(task: TxTask<any>) {
        logger.info("[C1Component:doit] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com/doit');

        whatIsCalled++;
        if (whatIsCalled >= 2) {
          done();
        }
      }

      error(task: TxTask<any>) {
        logger.error("[C1Component:error] is called and that's ok .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com/error');

        whatIsCalled++;
        if (whatIsCalled >= 2) {
          done();
        }        
      }     
    }    

    logger.info('[tx-singlepoint-set-callback.spec]: check mountpoint methods callback');

    new C1Component();
    let singlepoint = TxSinglePointRegistry.instance.get('GITHUB::GISTP::C1');
    
    logger.info('[tx-singlepoint-set-callback.spec]: mountpoint name is - \'' + singlepoint.name + '\'');
    expect(singlepoint.name).to.equal('GITHUB::GISTP::C1');
    
    let task: TxTask<any>;
    task = new TxTask({from: 'test'}, {from: 'https://api.github.com/doit'});
    singlepoint.tasks().next(task);

    task = new TxTask({from: 'tesk'}, {from: 'https://api.github.com/error'});
    singlepoint.tasks().error(task);
  });

});