
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('Registry-Test');
import * as short from 'short-uuid';
const translator = short();

import 'mocha';
import { expect } from 'chai';

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';

describe('Registry Classes - TxMountPointRegitry', () => {
  
  before(function() {
    translator.new();
  });

  it('check TxMountPointRegistry', () => {
    let n = translator.new()
    console.log('short.uuid()      = ' + short.uuid());
    console.log('short.uuid()      = ' + short.uuid());
    console.log('translator.new() = ' + n);
    console.log('translator.toUUID = ' + translator.toUUID(n));
    console.log('translator.fromUUID = ' + translator.fromUUID('08690cfa-95df-4c76-aa3b-fb715830d6e4'));
    console.log('translator.fromUUID = ' + short().new());
    
    let MP1 = TxMountPointRegistry.instance.create('WORK::C1');
    let MP2 = TxMountPointRegistry.instance.get('WORK::C1');

     expect(MP1.name).to.equal('WORK::C1');
     expect(MP1.name).to.equal('WORK::C1');
  });

  it('check TxJobRegistry', () => {
   

  });

});
