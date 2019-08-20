
import createLogger from 'logging';
const logger = createLogger('Job-Serialize-Test');

import 'mocha';
import {expect, assert} from 'chai';
import * as short from 'short-uuid';

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxJobServicesEmptyJSON } from './../../src/tx-job-services-json';
import { TxJobServices } from '../../src/tx-job-services';
import { TxJobRegistry } from '../../src/tx-job-resgitry';
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';

import { C1Component } from './C1.component';
import { C2Component } from './C2.component';
import { C3Component } from './C3.component';
import { TxJobExecutionOptions } from '../../src/tx-job-execution-options';
import { TxJobServicesComponent } from '../../src/tx-job-services-component';

TxMountPointRegistry.instance.create('GITHUB::GIST::A1');
TxMountPointRegistry.instance.create('GITHUB::GIST::A2');
TxMountPointRegistry.instance.create('GITHUB::GIST::A3');

TxMountPointRegistry.instance.create('GITHUB::GIST::B1');
TxMountPointRegistry.instance.create('GITHUB::GIST::B2');
TxMountPointRegistry.instance.create('GITHUB::GIST::B3');

TxMountPointRegistry.instance.create('GITHUB::GIST::C1');
TxMountPointRegistry.instance.create('GITHUB::GIST::C2');
TxMountPointRegistry.instance.create('GITHUB::GIST::C3');

import { TxQueuePointRegistry } from '../../src/tx-queuepoint-registry'
import { TxRoutePointRegistry} from '../../src/tx-routepoint-registry'

import { TxConnectorRabbitMQ } from '../connectors/connector-rabbitmq-empty';
import { TxConnectorExpress } from './../connectors/connector-express-empty';

TxQueuePointRegistry.instance.setDriver(TxConnectorRabbitMQ);
// TxRoutePointRegistry.instance.setDriver(TxConnectorExpress);

new TxJobServicesComponent().init();  

describe('S2S: Job With Service', () => {

  /**
   */

  it('tx-job-services-serialize.spec.ts: check job services serialization', () => {
    logger.info('tx-job-services-serialize.spec.ts: check job services serialization');
        
    let services = new TxJobServices(null);

    services.on('service-a').add('GITHUB::GIST::A1');
    services.on('service-a').add('GITHUB::GIST::A2');
    services.on('service-a').add('GITHUB::GIST::A3');

    services.on('service-b').add('GITHUB::GIST::B1');
    services.on('service-b').add('GITHUB::GIST::B2');
    services.on('service-b').add('GITHUB::GIST::B3');

    services.on('service-c').add('GITHUB::GIST::C1');
    services.on('service-c').add('GITHUB::GIST::C2');
    services.on('service-c').add('GITHUB::GIST::C3');

    let before = services.toJSON()
    console.log("TxJobServices: serialize = ", JSON.stringify(before, undefined, 2));

    services = new TxJobServices(null).upJSON(before);   
    assert.deepEqual(before, services.toJSON());
  });

  it('tx-job-services-serialize.spec.ts: check job services serialization, check empty', () => {
    logger.info('tx-job-services-serialize.spec.ts: check job services serializationm check empty');
        
    let services = new TxJobServices(null);    

    assert.deepEqual(TxJobServicesEmptyJSON, services.toJSON());
  });

  it('tx-job-services-serialize.spec.ts: check running C1-C2-C3 S2S service after serialization', (done) => {
    logger.info('tx-job-services-serialize.spec.ts: check running C1-C2-C3 S2S service after serialization');

    try {
      new C1Component();
      new C2Component();
      new C3Component();
    }
    catch (e) {
      console.log('Components are already in the regitry');
    }
    
    TxJobRegistry.instance.setServiceName('service-a');
    let job = new TxJob('job-1'); 

    job.on('service-a').add('GITHUB::GIST::C1');
    job.on('service-a').add('GITHUB::GIST::C2');
    job.on('service-a').add('GITHUB::GIST::C3');

    const isCompletedTxJobServicesSerializeSpec1 = job.getIsCompleted().subscribe(
      (data) => {
        console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");
        expect(job.current.name).to.equal('GITHUB::GIST::C3');
        isCompletedTxJobServicesSerializeSpec1.unsubscribe();

        done();
      });                

    job.execute(new TxTask({
        method: 'create',
        status: 'start'
      },
      {something: 'more data here'}
      ),
      {
        execute: {source: 'service'}
      } as TxJobExecutionOptions
    );        
  }).timeout(2000);

}); 