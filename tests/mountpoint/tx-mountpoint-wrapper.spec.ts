
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Wrapper-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';
import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxTask } from '../../src/tx-task';
import {TxMountPoint} from '../../src/tx-mountpoint';
import {injectable} from "inversify";
import {TxConnector} from "../../src/tx-connector";

let C1: any;
let C2: any;
let C4: any;

describe('Mount Point Class Wrapp', () => {

  before(() => {
    TxMountPointRegistry.instance.del('GITHUB::GIST::C1');
    
    class C1Component {
      mountpoint: TxMountPoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C1');      

      constructor() {
        this.mountpoint.tasks().subscribe(
          (task: TxTask<any>) => {
            logger.info('[C1Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));          
            
            task.reply().next(new TxTask({method: 'reply', source: 'C1Component'}, task.data));            
          }
        )
      }
    }  

    C1 = new C1Component();
  });

  it('tx-mountpoint-wrapper.spec: send task to C1 and reply onyl to me', (done) => { 
    logger.info('tx-mountpoint-wrapper.spec: send task to C1 and reply onyl to me');

    const M1 = TxMountPointRegistry.instance.get('GITHUB::GIST::C1');
    const expected = {
      "head": {
        "method": "reply",
        "source": "C1Component"        
      },
      "data": {
        "from": "tsemach.org"
      }
    }

    M1.reply().subscribe(
      (task: TxTask<any>) => {
        logger.info('C1 - reply: task.get() =', JSON.stringify(task.get(), undefined, 2));
        assert.deepEqual(task.get(), expected);

        done();
      },
      (error: TxTask<any>) => {
    })

    let task = new TxTask({method: 'send', source: 'test'}, {from: 'tsemach.org'});
    M1.tasks().next(task);        
  });

  it('tx-mountpoint-wrapper.spec: send task to C1 and reply onyl to me', (done) => { 
    logger.info('tx-mountpoint-wrapper.spec: send task to C1 and reply onyl to me');

    const M1 = TxMountPointRegistry.instance.get('GITHUB::GIST::C1');
    const M2 = TxMountPointRegistry.instance.get('GITHUB::GIST::C1');
    const expected = {
      "head": {
        "method": "reply",
        "source": "C1Component"        
      },
      "data": {
        "from": "tsemach.org"
      }
    }

    M1.reply().subscribe(
      (task: TxTask<any>) => {
        logger.info('C1 - reply: task.get() =', JSON.stringify(task.get(), undefined, 2));
        assert.deepEqual(task.get(), expected);

        done();
      },
      (error: TxTask<any>) => {      
    });

    M2.reply().subscribe(
      (task: TxTask<any>) => {
        logger.error('C1 - reply: task.get() =', JSON.stringify(task.get(), undefined, 2));
        logger.error('M2 - shouldn\'t getting any callback here');
        expect(false).equal(true);

        done();
      },
      (error: TxTask<any>) => {      
    });

    let task = new TxTask({method: 'send', source: 'test'}, {from: 'tsemach.org'});    
    M1.tasks().next(task);        
  });

});