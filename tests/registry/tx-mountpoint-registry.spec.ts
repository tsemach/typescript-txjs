
import createLogger from 'logging';
const logger = createLogger('MountPoint-Registry-Test');

import * as short from 'short-uuid';
const translator = short();

import 'mocha';
import { expect } from 'chai';

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';

describe('Registry Classes - TxMountPointRegitry', () => {
  
  before(function() {
    translator.new();
  });

  it('tx-mountpoint-registry.spec: check TxMountPointRegistry', () => {
    let n = translator.new()
    logger.info('short.uuid()        = ' + short.uuid());
    logger.info('translator.new()    = ' + n);
    logger.info('translator.toUUID   = ' + translator.toUUID(n));
    logger.info('translator.fromUUID = ' + translator.fromUUID('08690cfa-95df-4c76-aa3b-fb715830d6e4'));
    logger.info('translator.fromUUID = ' + short().new());
    
    let MP1 = TxMountPointRegistry.instance.create('WORK::C1');
    let MP2 = TxMountPointRegistry.instance.get('WORK::C1');

     expect(MP1.name).to.equal('WORK::C1');
     expect(MP2.name).to.equal('WORK::C1');
  });

  it('tx-mountpoint-registry.spec: check TxJobRegistry', () => {
   

  });

});
