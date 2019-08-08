import createLogger from 'logging';
const logger = createLogger('Job-Serialize-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import {TxSinglePointRegistry} from '../../src/tx-singlepoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';
import * as short from 'short-uuid';
import {TxJobExecutionId} from "../../src";
import { TxJobServicesEmptyJSON } from '../../src/tx-job-services-json';
import { TxJobServicesComponent } from '../../src/tx-job-services-component';

import { TxQueuePointRegistry } from '../../src/tx-queuepoint-registry'
import { TxRoutePointRegistry} from '../../src/tx-routepoint-registry'

import { TxConnectorRabbitMQ } from '../connectors/connector-rabbitmq-empty';
import { TxConnectorExpress } from './../connectors/connector-express-empty';

TxQueuePointRegistry.instance.setDriver(TxConnectorRabbitMQ);
// TxRoutePointRegistry.instance.setDriver(TxConnectorExpress);

new TxJobServicesComponent().init();  

class Names {
  static GITHUB_GIST_C1 = Symbol('GITHUB_GIST_C1');
  static GITHUB_GIST_C2 = Symbol('GITHUB_GIST_C2');
  static GITHUB_GIST_C3 = Symbol('GITHUB_GIST_C3');
}

class C1Component {
  mountpoint = TxSinglePointRegistry.instance.create(Names.GITHUB_GIST_C1);

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C1Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));


        task.reply().next(new TxTask({method: 'from C1Component', status: 'ok'}, task['data']));
      });
  }
}

class C2Component {
  mountpoint = TxSinglePointRegistry.instance.create(Names.GITHUB_GIST_C2);

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C2Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));


        task.reply().next(new TxTask({method: 'from C2Component', status: 'ok'}, task['data']));
      });
  }
}

class C3Component {
  mountpoint = TxSinglePointRegistry.instance.create(Names.GITHUB_GIST_C3);

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[C3Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));


        task.reply().next(new TxTask({method: 'from C3Component', status: 'ok'}, task['data']));
      });
  }
}

try {
new C1Component();
new C2Component();
new C3Component();
}
catch (e) {
  console.log('Components are already in the registry')
}

describe('Job Class - Serialize', () => {

  const JobServices = {
    "stack": [ "service-a", "service-b", "service-c" ],
    "trace": [],
    "block": [ "service-a", "service-b", "service-c" ],
    "current": "",
    "jobs": [ 
      {
        "service": "service-a",
        "components": [ "GITHUB::GIST::A1", "GITHUB::GIST::A2", "GITHUB::GIST::A3" ]
      },
      {
        "service": "service-b",
        "components": [ "GITHUB::GIST::B1", "GITHUB::GIST::B2", "GITHUB::GIST::B3" ]
      },
      {
        "service": "service-c",
        "components": [ "GITHUB::GIST::C1", "GITHUB::GIST::C2", "GITHUB::GIST::C3" ]
      }
    ],
    "connectors": [
      {
        "service": "service-a",
        "connector": {"mode": "route", "host": "localhost", "port": "3001", "path": "route1"}
      },
      {
        "service": "service-b",
        "connector": {"mode": "route", "host": "localhost", "port": "3002", "path": "route2"},
      },
      {
        "service": "service-c",
        "connector": {"mode": "queue", "host": "service-a", "port": "0000", "path": "queue1"}
      }
    ]
  }

  /**
   */

  it('check job-serialize.spec.ts: toJSON | upJSON serialize', (done) => {
    logger.info('tx-job-serialize.spec.ts: check Job toJSON | upJSON serialize');

    let src = new TxJob('Job-1'); // or create through the TxJobRegistry

    src.add(TxSinglePointRegistry.instance.get(Names.GITHUB_GIST_C1));
    src.add(TxSinglePointRegistry.instance.get(Names.GITHUB_GIST_C2));
    logger.info('[toJSON | upJSON] src.toJSON = ' + JSON.stringify(src.toJSON(), undefined, 2));

    let dst = new TxJob('Job-1');

    dst.upJSON(src.toJSON());

    logger.info('[toJSON | upJSON] dst.toJSON = ' + JSON.stringify(dst.toJSON(), undefined, 2));
    assert.deepEqual(src.toJSON(), dst.toJSON());

    done();

  });

  it('check tx-job-serialize.spec.ts: upJSON serialize with continue', (done) => {
    logger.info('tx-tx-job-serialize.spec.ts: check tx-job-serialize.spec.ts: upJSON serialize with continue');

    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    /**
     * load job where GITHUB_GIST_C1 is already called so need to continue from GITHUB_GIST_C2
     * @type {TxJob}
     */
    let job = new TxJob('Job-1');
    let from = {
      name: 'GITHUB',
      uuid: uuid,
      block: "Symbol(GITHUB_GIST_C1),Symbol(GITHUB_GIST_C2),Symbol(GITHUB_GIST_C3)",
      stack: "Symbol(GITHUB_GIST_C3)",
      trace: "Symbol(GITHUB_GIST_C1)",
      single: false,
      revert: false,
      error: false,
      current: "Symbol(GITHUB_GIST_C2)",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence,
      services: TxJobServicesEmptyJSON
    };
    let after = job.upJSON(from).toJSON();
    logger.info('[upJSON] after = ' + JSON.stringify(after, undefined, 2));

    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);
    expect(from.executeUuid).to.equal(after['executeUuid']);
    expect(from.sequence).to.equal(after['sequence']);

    job.getIsCompleted().subscribe(
      (data) => {
        logger.debug('[job-serialize-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['head']['method']).to.equal("from C3Component");
        expect(data['head']['status']).to.equal("ok");
        done();
      });

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
  });

  it('check tx-job-serialize.spec.ts: check Job Services serialization toJSON | upJSON', () => {
    logger.info('tx-tx-job-serialize.spec.ts: check Job Services serialization toJSON | upJSON');

    let uuid = short().new();
    let executionId: TxJobExecutionId = {uuid: short().new(), sequence: 1};

    /**
     * load job where GITHUB_GIST_C1 is already called so need to continue from GITHUB_GIST_C2
     * @type {TxJob}
     */
    let job = new TxJob('Job-1');
    let from = {
      name: 'GITHUB',
      uuid: uuid,
      block: "Symbol(GITHUB_GIST_C1),Symbol(GITHUB_GIST_C2),Symbol(GITHUB_GIST_C3)",
      stack: "Symbol(GITHUB_GIST_C3)",
      trace: "Symbol(GITHUB_GIST_C1)",
      single: false,
      revert: false,
      error: false,
      current: "Symbol(GITHUB_GIST_C2)",
      executeUuid: executionId.uuid,
      sequence: executionId.sequence,
      services: JobServices
    };
    let after = job.upJSON(from).toJSON();
    console.log('[upJSON] after = ' + JSON.stringify(after, undefined, 2));

    assert.deepEqual(JobServices, after.services);   
    assert.deepEqual(from, after); 
  });
    
});