
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Method-Test');

import 'mocha';
import { expect, assert } from 'chai';
import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxTask } from '../../src/tx-task';

describe('Mount Point Class', () => {

  it('tx-mountpoint-method.spec: check mountpoint methods callback', (done) => {
    logger.info('tx-mountpoint-method.spec: check mountpoint methods callback');

    class C1Component {      
      private singlepoint = TxSinglePointRegistry.instance.create('GITHUB::GISTP::C1');    

      constructor() {
        logger.info("C1Component:con't is called, no need to subscribe, the method will take care of it");            
        this.singlepoint.tasks().method('doit', this);
        this.singlepoint.tasks().method('more', this);
      }
      
      doit(task: TxTask<any>) {
        logger.info("[C1Component:run] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com/doit');

        done();
      }

      more(task: TxTask<any>) {
        logger.info("[C1Component:more] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com/more');

        assert.isNotOk('ERROR: only run method should be called');
      }

      none(task: TxTask<any>) {
        logger.info("[C1Component:none] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com/more');

        assert.isNotOk('ERROR: only run method should be called');
      }
    }    

    logger.info('[tx-mountpoint-method.spec]: check mountpoint methods callback');

    new C1Component();
    let singlepoint = TxSinglePointRegistry.instance.get('GITHUB::GISTP::C1');
    
    logger.info('[tx-mountpoint-method.spec]: mountpoint name is - \'' + singlepoint.name + '\'');
    expect(singlepoint.name).to.equal('GITHUB::GISTP::C1');
    
    let task;
    task = new TxTask({method: 'doit'}, {from: 'https://api.github.com/doit'});
    singlepoint.tasks().next(task);

    // task = new TxTask({method: 'more'}, {from: 'https://api.github.com/more'});
    // singlepoint.tasks().next(task);
  });

  it('tx-mountpoint-method.spec.ts: check multiple calls to mountpoint methods callback', (done) => {
    logger.info('tx-mountpoint-method.spec.ts: check multiple calls to mountpoint methods callback')

    let numberOfCalles = 0;

    class S1Component {      
      private singlepoint = TxSinglePointRegistry.instance.create('GITHUB::GISTP::S1');    

      constructor() {
        logger.info("C1Component:con't is called, no need to subscribe, the method will take care of it");            
        this.singlepoint.tasks().method('run', this);
        this.singlepoint.tasks().method('more', this);
      }
      
      run(task: TxTask<any>) {
        logger.info("[C1Component:run] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com');

        numberOfCalles++
        if (numberOfCalles == 2)  {
          done();
        }
      }

      more(task: TxTask<any>) {
        logger.info("[C1Component:more] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com');

        numberOfCalles++
        if (numberOfCalles == 2)  {
          done();
        }

      }
    }    

    logger.info('[tx-mountpoint-method.spec]: check mountpoint methods callback');

    let C1 = new S1Component();
    let singlepoint = TxSinglePointRegistry.instance.get('GITHUB::GISTP::S1');
    
    logger.info('[tx-mountpoint-method.spec]: mountpoint name is - \'' + singlepoint.name + '\'');
    expect(singlepoint.name).to.equal('GITHUB::GISTP::S1');

    let task;

    task = new TxTask({method: 'run'}, {from: 'https://api.github.com'});
    singlepoint.tasks().next(task);

    task = new TxTask({method: 'more'}, {from: 'https://api.github.com'});
    singlepoint.tasks().next(task);

  });

  it('tx-mountpoint-method.spec.ts: check multiple calls to mountpoint methods callback using array', (done) => {
    logger.info('tx-mountpoint-method.spec.ts: check multiple calls to mountpoint methods callback using array')

    after('tx-mountpoint-method.spec.ts: - before -check multiple calls to mountpoint methods callback using array', () => {
      TxSinglePointRegistry.instance.del('GITHUB::GISTP::S3');    
    });

    let numberOfCalles = 0;

    class S3Component {      
      private singlepoint = TxSinglePointRegistry.instance.create('GITHUB::GISTP::S3');    

      constructor() {
        logger.info("C1Component:con't is called, no need to subscribe, the method will take care of it");            
        this.singlepoint.tasks().method(['run', 'more'], this);        
      }
      
      run(task: TxTask<any>) {
        logger.info("[C1Component:run] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com');

        numberOfCalles++
        if (numberOfCalles == 2)  {
          done();
        }
      }

      more(task: TxTask<any>) {
        logger.info("[C1Component:more] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com');

        numberOfCalles++
        if (numberOfCalles == 2)  {
          done();
        }

      }
    }    

    logger.info('[tx-mountpoint-method.spec]: check mountpoint methods callback');

    let C1 = new S3Component();
    let singlepoint = TxSinglePointRegistry.instance.get('GITHUB::GISTP::S3');
    
    logger.info('[tx-mountpoint-method.spec]: mountpoint name is - \'' + singlepoint.name + '\'');
    expect(singlepoint.name).to.equal('GITHUB::GISTP::S3');

    let task;

    task = new TxTask({method: 'run'}, {from: 'https://api.github.com'});
    singlepoint.tasks().next(task);

    task = new TxTask({method: 'more'}, {from: 'https://api.github.com'});
    singlepoint.tasks().next(task);
  });

});