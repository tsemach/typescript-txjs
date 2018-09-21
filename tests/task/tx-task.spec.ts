
//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';
import { TxTask } from '../../src/tx-task';

describe('Task Class Test', () => {

  it('check tx-task simple head & data', () => {
    let t = new TxTask({method: 'doit', status: 'ok'}, {data: 'this is my data'});
   
    logger.info('t.head = ' + JSON.stringify(t.head, undefined, 2));
    logger.info('t.data = ' + JSON.stringify(t.data, undefined, 2));

    expect('doit').to.equal(t.head.method);
    expect('ok').to.equal(t.head.status);
    assert.deepEqual({method: 'doit', status: 'ok'}, t.head);
    assert.deepEqual({data: 'this is my data'}, t.data);

  });

  it('force Head to be of a specific type', () => {
    interface Head {
      source: string;
      method: string;
      status: string;
    }
  
    interface Data {
      data: string
    }

    let t = new TxTask<Head>({source: 'other', method: 'doit', status: 'ok'}, {data: 'this is again my data'});
    
    let h: Head = t.head;
    let d: Data = t.data;

    assert.deepEqual({source: 'other', method: 'doit', status: 'ok'}, h);
    assert.deepEqual({data: 'this is again my data'}, d);

  });

  it('check head with type alias', () => {
    type Head = {
      source: string;
      method: string;
      status: string;
    }
  
    type Data = { 
      data: string
    }

    let t = new TxTask<Head>({source: 'other', method: 'doit', status: 'ok'}, {data: 'this is again my data'});
  
    let h: Head = t.head;
    let d: Data = t.data;

    assert.deepEqual({source: 'other', method: 'doit', status: 'ok'}, h);
    assert.deepEqual({data: 'this is again my data'}, d);
  });

});