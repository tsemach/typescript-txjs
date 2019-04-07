
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Method-Test');

import 'mocha';
import { expect, assert } from 'chai';
import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxTask } from '../../src/tx-task';
import {TxMountPoint} from '../../src/tx-mountpoint';
import {injectable} from "inversify";
import {TxConnector} from "../../src/tx-connector";

describe('Mount Point Class', () => {

  it('tx-mountpoint-method.spec: check mountpoint methods callback', (done) => {
    logger.info('tx-mountpoint-method.spec: check mountpoint methods callback');

    class C1Component {      
      private mountpoint = TxMountPointRegistry.instance.create('MOUNTPOINT::METHOD::SPEC::C1');    

      constructor() {
        logger.info("C1Component:con't is called, no need to subscribe, the method will take care of it");            
        this.mountpoint.tasks().method('run', this);
        this.mountpoint.tasks().method('more', this);
      }
      
      run(task) {
        logger.info("[C1Component:run] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com');

        done();
      }

      more(task) {
        logger.info("[C1Component:more] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com');

        assert.isNotOk('ERROR: only run method should be called');
      }
    }    

    logger.info('[tx-mountpoint-method.spec]: check mountpoint methods callback');

    let C1 = new C1Component();
    let mountpoint = TxMountPointRegistry.instance.get('MOUNTPOINT::METHOD::SPEC::C1');
    
    logger.info('[tx-mountpoint-method.spec]: mountpoint name is - \'' + mountpoint.name + '\'');
    expect(mountpoint.name).to.equal('MOUNTPOINT::METHOD::SPEC::C1');

    let task = new TxTask({method: 'run'}, {from: 'https://api.github.com'});
    mountpoint.tasks().next(task);

  });

  it('tx-mountpoint-method.spec.ts: check multiple calls to mountpoint methods callback', (done) => {
    logger.info('tx-mountpoint-method.spec.ts: check multiple calls to mountpoint methods callback')

    let numberOfCalles = 0;

    class C2Component {      
      private mountpoint = TxMountPointRegistry.instance.create('MOUNTPOINT::METHOD::SPEC::C2');    

      constructor() {
        logger.info("C1Component:con't is called, no need to subscribe, the method will take care of it");            
        this.mountpoint.tasks().method('run', this);
        this.mountpoint.tasks().method('more', this);
      }
      
      run(task) {
        logger.info("[C1Component:run] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com');

        numberOfCalles++
        if (numberOfCalles == 2)  {
          done();
        }
      }

      more(task) {
        logger.info("[C1Component:more] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com');

        numberOfCalles++
        if (numberOfCalles == 2)  {
          done();
        }

      }
    }    

    logger.info('[tx-mountpoint-method.spec]: check mountpoint methods callback');

    let C1 = new C2Component();
    let mountpoint = TxMountPointRegistry.instance.get('MOUNTPOINT::METHOD::SPEC::C2');
    
    logger.info('[tx-mountpoint-method.spec]: mountpoint name is - \'' + mountpoint.name + '\'');
    expect(mountpoint.name).to.equal('MOUNTPOINT::METHOD::SPEC::C2');

    let task;

    task = new TxTask({method: 'run'}, {from: 'https://api.github.com'});
    mountpoint.tasks().next(task);

    task = new TxTask({method: 'more'}, {from: 'https://api.github.com'});
    mountpoint.tasks().next(task);

  });

});