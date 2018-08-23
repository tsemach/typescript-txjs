
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('Registry-Test');

import 'mocha';
import { expect } from 'chai';
import { TxRegistry } from '../../src/tx-registry';

describe('Registry Class', () => {
  
  class Component {
    name: 'SaveMe'
    constructor() {      
    }

    getName() {
      return 'SaveMe';
    }
  }  

  before(function() {

  });

  it('send task from gist-get-filename to gist-get-raw-url', () => {
   
    

    // // create the two components and let them register themselfs.
    // let C1 = new C1Component();
    // let C2 = new C2Component();
    
    // let M1 = TxMountPointRegistry.instance.get('GITHUB::GIST::C1');    
    // let task = new TxTask('get', '', {from: 'https://api.github.com'});

    // // send task on C1 then C1 -> C2 -> C1.
    // M1.tasks().next(task);
        
    // expect(C1.getReply()).to.equal(JSON.stringify(task));
  });

});