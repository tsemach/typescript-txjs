import createLogger from 'logging';
const logger = createLogger('Job-Execute-Test');

import 'mocha';
import {expect} from 'chai';

import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxMountPointRegistry } from './../../src/tx-mountpoint-registry';
import { TxJobExecutionOptions } from "../../src/tx-job-execution-options";
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';
import { TxJobRegistry } from "../../src";
import { TxDistributeBull } from './../../src/tx-disribute-bull';

import { S1Component } from './components/S1.component';
import { S2Component } from './components/S2.component';
import { S3Component } from './components/S3.component';

import { TxJobServicesEmptyJSON } from '../../src/tx-job-services-json';
import { TxJobServicesComponent } from '../../src/tx-job-services-component';

import { TxQueuePointRegistry } from '../../src/tx-queuepoint-registry'
import { TxRoutePointRegistry} from '../../src/tx-routepoint-registry'

import { TxConnectorRabbitMQ } from '../connectors/connector-rabbitmq-empty';
import { TxConnectorExpress } from './../connectors/connector-express-empty';
import TxNames from '../../src/tx-names';
import { TxJobEventType } from '../../src/tx-Job-event-type';

TxQueuePointRegistry.instance.setDriver(TxConnectorRabbitMQ);
TxRoutePointRegistry.instance.setDriver(TxConnectorExpress);

new TxJobServicesComponent().init();  

describe('Job Class Execute Test', () => {
  try {
    new S1Component();
    new S2Component();
    new S3Component();
  }
  catch (e) {
    console.log('Components is already exist')
  }  
  TxJobRegistry.instance.setDitribute(new TxDistributeBull('redis://localhost:6379'));

  /**
   */

  it('tx-job-distribute.spec: check running S1-S2-S3 through distribute', (done) => {
    logger.info('tx-job-distribute.spec: check running S1-S2-S3 through distribute');    

    let job = new TxJob('job-1'); // or create through the TxJobRegistry    

    job.add(TxSinglePointRegistry.instance.get('GITHUB::S1'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S2'));
    job.add(TxSinglePointRegistry.instance.get('GITHUB::S3'));

    TxJobRegistry.instance.once('job: ' + job.getUuid(), (data: TxJobEventType) => {      
      console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
      
      expect(data.data['head']['method']).to.equal("from S3");
      expect(data.data['head']['status']).to.equal("ok");
      expect(data.job.current.name).to.equal('GITHUB::S3');

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

  // it('tx-job-continue-spec: check S1-S2-S3 upJSON with execute', (done) => {
  //   logger.info('running: tx-job-execute.spec: check S1-S2-S3 upJSON with execute');

  //   let uuid = short().new();
  //   let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

  //   let job = new TxJob('Job-1');
  //   let from = {
  //     name: "GitHub",
  //     uuid: uuid,
  //     block: "GITHUB::S1,GITHUB::S2,GITHUB::S3",
  //     stack: "GITHUB::S1,GITHUB::S2,GITHUB::S3",
  //     trace: "",
  //     single: false,
  //     revert: false,
  //     error: false,
  //     current: "",
  //     executeUuid: executionId.uuid,
  //     sequence: executionId.sequence,
  //     services: TxJobServicesEmptyJSON
  //   };
  //   let after = job.upJSON(from).toJSON();

  //   expect(from.name).to.equal(after['name']);
  //   expect(from.uuid).to.equal(after['uuid']);
  //   expect(from.stack).to.equal(after['stack']);
  //   expect(from.trace).to.equal(after['trace']);
  //   expect(from.single).to.equal(after['single']);
  //   expect(from.block).to.equal(after['block']);
  //   expect(from.current).to.equal(after['current']);
  //   expect(from.executeUuid).to.equal(after['executeUuid']);
  //   expect(from.sequence).to.equal(after['sequence']);

  //   job.getIsCompleted().subscribe(
  //     (data) => {
  //       logger.info('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
  //       expect(data['head']['method']).to.equal("from S3");
  //       expect(data['head']['status']).to.equal("ok");

  //       done();
  //     });                

  //   job.execute(new TxTask({
  //       method: 'create',
  //       status: ''
  //     },
  //     {something: 'more data here'})
  //   );
    
  // });

});