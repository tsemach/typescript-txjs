
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Method-Error-Test');

import 'mocha';
import { expect, assert } from 'chai';
import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxTask } from '../../src/tx-task';

describe('Mount Point Class', () => {

  it('tx-mountpoint-method-error.spec: check mountpoint methods callback', (done) => {
    logger.info('tx-mountpoint-method-error.spec: check mountpoint methods callback');
    
    class S1Component {
      private mountpoint = TxMountPointRegistry.instance.create('GITHUB::GISTP::S1');

      constructor() {
        logger.info("S1Component:constructor is called, no need to subscribe, the method will take care of it");            
        this.mountpoint.tasks().method(['doit', 'more'], this, this.error);
      }
      
      doit(task: TxTask<any>) {
        logger.info("[S1Component:doit] is called .. task = ", task.get());
        expect(task.data.from).to.equal('https://api.github.com/doit');      
      }

      error(task: TxTask<any>) {
        logger.info("[S1Component:error] is called .. task = ", task.get());
        expect(task.data.from).to.equal('https://api.github.com/doit');
        done();
      }

      more(task: TxTask<any>) {
        logger.info("[S1Component:more] is called .. task = ", task.get());
        expect(task.data.from).to.equal('https://api.github.com/more');        
      }
    }    

    logger.info('[tx-mountpoint-method-error.spec]: check mountpoint methods callback');

    TxMountPointRegistry.instance.del('GITHUB::GISTP::S1');
    new S1Component();
    let mountpoint = TxMountPointRegistry.instance.get('GITHUB::GISTP::S1');
    
    logger.info('[tx-mountpoint-method-error.spec]: mountpoint name is - \'' + mountpoint.name + '\'');
    expect(mountpoint.name).to.equal('GITHUB::GISTP::S1');
    
    let task: TxTask<any>;

    task = new TxTask({method: 'doit'}, {from: 'https://api.github.com/doit'});
    mountpoint.tasks().next(task);

    task = new TxTask({method: 'more'}, {from: 'https://api.github.com/more'});
    mountpoint.tasks().next(task);
    
    task = new TxTask({method: 'more'}, {from: 'https://api.github.com/doit'});
    mountpoint.tasks().error(task);
  });

});