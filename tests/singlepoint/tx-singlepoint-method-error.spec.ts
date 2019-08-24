
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Method-Test');

import 'mocha';
import { expect, assert } from 'chai';
import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxTask } from '../../src/tx-task';

describe('Mount Point Class', () => {

  it('tx-mountpoint-method.spec: check mountpoint methods callback', () => {
    logger.info('tx-mountpoint-method.spec: check mountpoint methods callback');

    class S1Component {
      private singlepoint = TxSinglePointRegistry.instance.create('GITHUB::GISTP::S1');

      constructor() {
        logger.info("S1Component:con't is called, no need to subscribe, the method will take care of it");            
        this.singlepoint.tasks().method(['doit', 'more'], this, this.error);
        //this.singlepoint.tasks().method('more', this);
      }
      
      doit(task: TxTask<any>) {
        logger.info("[S1Component:doit] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com/doit');

        //done();
      }

      error(task: TxTask<any>) {
        logger.info("[S1Component:error] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com/doit');

      }

      more(task: TxTask<any>) {
        logger.info("[S1Component:more] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com/more');

        //assert.isNotOk('ERROR: only run method should be called');
      }

      none(task: TxTask<any>) {
        logger.info("[S1Component:none] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com/more');

        assert.isNotOk('ERROR: only run method should be called');
      }
    }    

    logger.info('[tx-mountpoint-method.spec]: check mountpoint methods callback');

    TxSinglePointRegistry.instance.del('GITHUB::GISTP::S1');
    new S1Component();
    let singlepoint = TxSinglePointRegistry.instance.get('GITHUB::GISTP::S1');
    
    logger.info('[tx-mountpoint-method.spec]: mountpoint name is - \'' + singlepoint.name + '\'');
    expect(singlepoint.name).to.equal('GITHUB::GISTP::S1');
    
    let task: TxTask<any>;

    task = new TxTask({method: 'doit'}, {from: 'https://api.github.com/doit'});
    singlepoint.tasks().next(task);

    task = new TxTask({method: 'more'}, {from: 'https://api.github.com/more'});
    singlepoint.tasks().next(task);
    
    task = new TxTask({method: 'more'}, {from: 'https://api.github.com/doit'});
    singlepoint.tasks().error(task);   
  });

});
