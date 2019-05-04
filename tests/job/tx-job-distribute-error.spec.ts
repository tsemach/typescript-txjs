
import createLogger from 'logging';
const logger = createLogger('Job-Execute-Test');

import 'mocha';
import {expect} from 'chai';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxMountPointRxJSRegistry } from './../../src/tx-mountpointrxjs-registry';
import { TxJobExecutionOptions } from "../../src/tx-job-execution-options";
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';
import { TxJobRegistry } from "../../src";
import { TxDistributeComponentHead } from './../../src/tx-distribute-component-head';
import { TxDistribute, TxDistributeSourceType, TxDistributeType } from './../../src/tx-distribute';

import { E1Component } from './components/E1.component';
import { E2Component } from './components/E2.component';
import { E3Component } from './components/E3.component';

import { TxNames } from '../../src/tx-names';
import { TxJobEventType } from '../../src/tx-Job-event-type';

const sandbox = sinon.createSandbox();

class TxDistributeBull implements TxDistribute {
  
  private readonly name = 'distributer'  
  connection = '';

  constructor(connection: any) {
    logger.info(`going to connect to '${connection}`)    
    this.connection = connection;
  }

  send(from: TxDistributeSourceType, type: TxDistributeType, task: TxTask<any>, options: TxJobExecutionOptions): Promise<any> {     
    return Promise.resolve(this.bypass({from, type, task: task.get(), options}));    
  }

  bypass(data: {from: TxDistributeSourceType, type: TxDistributeType, task: any, options: TxJobExecutionOptions}) {    
    logger.info(`[TxDistributeBull::byoass] job process callback  from '${JSON.stringify(data, undefined, 2)}`)
    TxMountPointRxJSRegistry
      .instance
      .get(TxNames.RX_TXJS_DISTRIBUTE_COMPONENT)
      .tasks()
      .next(new TxTask<TxDistributeComponentHead>({method: 'run', type: data.type}, data))
    return true;      
  }
}

describe('Job Class Execute Test', () => {
  try {
    new E1Component();
    new E2Component();
    new E3Component();
  }
  catch (e) {
    console.log('Components is already exist')
  }  

  TxJobRegistry.instance.setDistribute(new TxDistributeBull('redis://localhost:6379'));

  /**
   */     
  let d_spy: any;
  let j_spy: any;
  let expect_call_arg_0: any;
  let expect_call_arg_1: any;
  let expect_call_arg_2: any;
  let expect_call_arg_3: any;

  before('tx-job-distribute.spec: (before) check running S1-S2-S3 through distribute', () =>{

    expect_call_arg_0 = { 
      head: { method: 'from E1', status: 'ok' },
      data: { something: 'more data here' } 
    };
  
    expect_call_arg_1 = { 
      head: { method: 'from E2', status: 'ok' },
      data: { something: 'more data here' } 
    };

    expect_call_arg_2 = { 
      head: { method: 'from E3', status: 'ERROR' },
      data: { something: 'more data here' } 
    };

    expect_call_arg_3 = { 
      head: { method: 'from E2', status: 'ERROR' },
      data: { something: 'more data here' } 
    };

    const distributer = new TxDistributeBull('redis://localhost:6379');
    d_spy = sinon.spy(distributer, 'bypass');
    
    TxJobRegistry.instance.setDistribute(distributer);
  });

  after('', () => {
    d_spy.restore();
    j_spy.restore();
  });

  it('tx-job-distribute.spec: check running E1-E2-E3 through distribute', (done) => {
    logger.info('tx-job-distribute.spec: check running E1-E2-E3 through distribute');    

    let job = new TxJob('job-1'); // or create through the TxJobRegistry    

    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E3'));

    TxJobRegistry.instance.once('job:error: ' + job.getUuid(), (data: TxJobEventType) => {      
      console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));

      const expected = {
        head: {
          method: "from E1",
          status: "ERROR"
        },
        data: {
          something: "more data here"
        }
      }

      const distributer = TxJobRegistry.instance.getDistribute() as TxDistributeBull;
      assert.deepEqual(data.task.get(), expected);
      expect(distributer.connection).to.equal('redis://localhost:6379');

      expect(d_spy.callCount).to.equal(4);
      expect(d_spy.getCall(0).args[0].type).to.equal('job');

      assert.deepEqual(d_spy.getCall(0).args[0].task, expect_call_arg_0);
      assert.deepEqual(d_spy.getCall(1).args[0].task, expect_call_arg_1);
      assert.deepEqual(d_spy.getCall(2).args[0].task, expect_call_arg_2);
      assert.deepEqual(d_spy.getCall(3).args[0].task, expect_call_arg_3);

      done();
    });
        
    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'}
      ),
      {
        publish: 'distribute'
      } as TxJobExecutionOptions
    );
  })  

});