
import createLogger from 'logging';
const logger = createLogger('Job-Execute-Test');

import 'mocha';
import {expect} from 'chai';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxMountPointRegistry } from './../../src/tx-mountpoint-registry';
import { TxJobExecutionOptions } from "../../src/tx-job-execution-options";
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';
import { TxJobRegistry } from "../../src";
import { TxDistributeComponentHead } from './../../src/tx-distribute-component-head';
import { TxDistribute, TxDistributeSourceType, TxDistributeType } from './../../src/tx-distribute';

import { S1Component } from './components/S1.component';
import { S2Component } from './components/S2.component';
import { S3Component } from './components/S3.component';

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
    TxMountPointRegistry
      .instance
      .get(TxNames.RX_TXJS_DISTRIBUTE_COMPONENT)
      .tasks()
      .next(new TxTask<TxDistributeComponentHead>({method: 'run', type: data.type}, data))
    return true;      
  }
}

describe('Job Class Execute Test', () => {
  try {
    new S1Component();
    new S2Component();
    new S3Component();
  }
  catch (e) {
    console.log('Components is already exist')
  }  

  TxJobRegistry.instance.setDistribute(new TxDistributeBull('redis://localhost:6379'));

  /**
   */     
  let spy: any;
  let expect_call_arg_0: any;
  let expect_call_arg_1: any;

  before('tx-job-distribute.spec: (before) check running S1-S2-S3 through distribute', () =>{

    expect_call_arg_0 = { 
      head: { method: 'from S1', status: 'ok' },
      data: { something: 'more data here' } 
    };
  
    expect_call_arg_1 = { 
      head: { method: 'from S2', status: 'ok' },
      data: { something: 'more data here' } 
    };

    const distributer = new TxDistributeBull('redis://localhost:6379');
    spy = sinon.spy(distributer, 'bypass');

    TxJobRegistry.instance.setDistribute(distributer);
  });

  after('', () => {
    spy.restore();
  });

  it('tx-job-distribute.spec: check running S1-S2-S3 through distribute', (done) => {
    logger.info('tx-job-distribute.spec: check running S1-S2-S3 through distribute');    

    let job = new TxJob('job-1'); // or create through the TxJobRegistry    

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

    TxJobRegistry.instance.once('job: ' + job.getUuid(), (data: TxJobEventType) => {      
      console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));

      const distributer = TxJobRegistry.instance.getDistribute() as TxDistributeBull;
         
      expect(data.task['head']['method']).to.equal("from S3");
      expect(data.task['head']['status']).to.equal("ok");
      expect(data.job.current.name).to.equal('GITHUB::S3');      
      expect(distributer.connection).to.equal('redis://localhost:6379');

      expect(spy.callCount).to.equal(2);
      expect(spy.getCall(0).args[0].type).to.equal('job');

      assert.deepEqual(spy.getCall(0).args[0].task, expect_call_arg_0);
      assert.deepEqual(spy.getCall(1).args[0].task, expect_call_arg_1);

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