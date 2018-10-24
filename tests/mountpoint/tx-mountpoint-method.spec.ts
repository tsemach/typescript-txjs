
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Test');

import 'mocha';
import { expect } from 'chai';
import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxTask } from '../../src/tx-task';
import {TxMountPoint} from '../../src/tx-mountpoint';
import {injectable} from "inversify";
import {TxConnector} from "../../src/tx-connector";

describe('Mount Point Class', () => {

  it('tx-mountpoint-method.spec: check mountpoint methods callback', (done) => {
    class C1Component {      
      private mountpoint = TxMountPointRegistry.instance.create('GITHUB::GISTP::C1');    

      constructor() {
        logger.info("C1Component:con't is called, no need to subscribe, the method will take care of it");            
        this.mountpoint.tasks().method('run', this);
      }
      
      run(task) {
        logger.info("[C1Component:run] is called .. task = ", task);
        expect(task.data.from).to.equal('https://api.github.com');

        done();
      }

    }    

    logger.info('[tx-mountpoint-method.spec]: check mountpoint methods callback');

    let C1 = new C1Component();
    let mountpoint = TxMountPointRegistry.instance.get('GITHUB::GISTP::C1');
    
    logger.info('[tx-mountpoint-method.spec]: mountpoint name is - \'' + mountpoint.name + '\'');
    expect(mountpoint.name).to.equal('GITHUB::GISTP::C1');

    let task = new TxTask({method: 'run'}, {from: 'https://api.github.com'});

    mountpoint.tasks().next(task);

  });

});