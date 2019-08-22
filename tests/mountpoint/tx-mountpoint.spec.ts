
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Test');

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

describe('Mount Point Class', () => {

  /**
   * 1) Test send a message via the C1's mount-point (M1).
   * 2) C1 receive the message on it's mount-point tasks subscribe method.
   * 3) C1 send a task to C2.
   * 4) C2 receive the task by it's own mount-point on the tasks Subscribe method.
   * 5) C2 send reply back to C1 on C1 reply Subscription.
   */

  before(() => {
    class C1Component {
      mountpoint: TxMountPoint = <TxMountPoint>TxMountPointRegistry.instance.create('GITHUB::GIST::C1');
      reply: any;

      constructor() {
        this.mountpoint.tasks().subscribe(
          (task: TxTask<any>) => {
            logger.info('[C1Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          

            // C1 got a task then send it C2.
            let M2 = <TxMountPoint>TxMountPointRegistry.instance.get('GITHUB::GIST::C2');

            M2.tasks().next(new TxTask({method: 'get', status: ''}, task['data']));
          }
        )

        this.mountpoint.reply().subscribe(
          (reply: TxTask<any>) => {
            logger.info('[C1Component:reply] got reply = ' + JSON.stringify(reply, undefined, 2));                    

            this.reply = reply;
          }
        )
      }

      getReply() {
        return JSON.stringify(this.reply);
      }

    }  

    class C2Component {
      mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C2');    
      task: any;

      constructor() {
        this.mountpoint.tasks().subscribe(
          (task: TxTask<any>) => {
            logger.info('[C2Component:task] got task = ' + JSON.stringify(task, undefined, 2));
            this.task = task;
            
            // C2 got a task from C1, then send it back to C1 on the reply Subject of M1 mount-point
            let M1 = TxMountPointRegistry.instance.get('GITHUB::GIST::C1');

            M1.reply().next(new TxTask({method: 'get', status: ''}, task['data']));
          }
        )  
      }

      getTask() {
        return this.task;
      }
    }  

    class C4Component {
      mountpoint = TxMountPointRegistry.instance.create('GITHUB::GIST::C4');
      task: any;

      constructor() {
        this.mountpoint.tasks().subscribe(
          (task: TxTask<any>) => {
            logger.info('[C4Component:task] got task = ' + JSON.stringify(task, undefined, 2));
            this.task = task;
            
            this.mountpoint.reply().next(new TxTask({method: 'get', status: ''}, {from: 'C4Component', ...task['data']}));
          }
        )  
      }

      getTask() {
        return this.task;
      }
    }  

    C1 = new C1Component();
    C2 = new C2Component();
    C4 = new C4Component();
  })
  it('mountpoint.spec: send task from gist-get-filename to gist-get-raw-url', () => {
   
    // create the two components and let them register themselfs.
    
    let M1 = <TxMountPoint>TxMountPointRegistry.instance.get('GITHUB::GIST::C1');
    let task = new TxTask({method: 'get', status: ''}, {from: 'https://api.github.com'});

    // send task on C1 then C1 -> C2 -> C1.
    M1.tasks().next(task);
        
    expect(C1.getReply()).to.equal(JSON.stringify(task));
  });

  it('tx-mountpoint.spec: check mountpoint name as string | symbol', () => {

    let mountpoint: TxMountPoint;

    mountpoint = <TxMountPoint>TxMountPointRegistry.instance.create('GITHUB::GIST::C3');

    console.log('mountpoint name is - \'' + mountpoint.name + '\'');
    expect(mountpoint.name).to.equal('GITHUB::GIST::C3');

    mountpoint = TxMountPointRegistry.instance.create(Symbol('GITHUB::GIST::C3'));

    console.log('mountpoint name is - \'' + mountpoint.name + '\'');
    expect(mountpoint.name).to.equal('Symbol(GITHUB::GIST::C3)');

  });

  it('tx-mountpoint.spec: simple next subscribe call', () => {
    const mp = TxMountPointRegistry.instance.get('GITHUB::GIST::C4');

    logger.info('C3 - mountpoint name is - \'' + mp.name + '\'');
    expect(mp.name).to.equal('GITHUB::GIST::C4');

    const expected = {
      "head": {
        "source": "test"
      },
      "data": {
        "from": "tsemach.org"
      }
    }

    mp.reply().subscribe(
      (task: TxTask<any>) => {
        logger.info('C4 - reply: task.get() =', task.get());
        assert.deepEqual(task.get(), expected);
      },
      (error: TxTask<any>) => {      
    })

    console.log('mountpoint name is - \'' + mp.name + '\'');
    expect(mp.name).to.equal('GITHUB::GIST::C4');

    mp
    .tasks()
    .next(new TxTask<any>({source: 'test'}, {from: 'tsemach.org'}));
    
  });

});