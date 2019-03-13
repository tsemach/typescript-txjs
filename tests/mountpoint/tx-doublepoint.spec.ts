
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Test');

import 'mocha';
import { expect } from 'chai';
import { TxTask } from '../../src/tx-task';
import {TxMountPoint} from '../../src/tx-mountpoint';
import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';

describe('Double Point Class', () => {

  class D1Component {
    singlepoint: TxMountPoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::C1');    

    constructor() {
      this.singlepoint.tasks().subscribe(
        (task: TxTask<any>) => {
          logger.info('[D1Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));                    
          
          task.reply().next(new TxTask({method: 'from D1 component', status: 'ok'}, task.getData()));
        }
      )      
    }
  }  

  it('tx-doublepoint.spec: check the use of doublepoint', () => {
    logger.info('tx-doublepoint.spec: check the use of doublepoint')
    
    new D1Component();
    
    let doublepoint = TxSinglePointRegistry.instance.double('GITHUB::GIST::C1')

    doublepoint.reply().subscribe(
      (data) => {
        console.log('doublepoint::reply: got reply from D1Component = ', data.getData());
      }
    )

    // let task = new TxTask({method: 'get', status: ''}, {from: 'https://api.github.com'});
    // task.setReply(doublepoint.reply());
    doublepoint.tasks().next(
      new TxTask(
        {method: 'get', status: ''}, 
        {from: 'https://api.github.com'}
      )
      .setReply(doublepoint.reply())
    )

  });
});