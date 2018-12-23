import createLogger from 'logging';
const logger = createLogger('Job-Service-Test');

import 'mocha';
import { expect, assert } from 'chai';
import * as short from 'short-uuid';

import { TxSubscribe } from './../../src/tx-subscribe';
import { TxTask } from '../../src/tx-task';
import { TxJob } from './../../src/tx-job';
import { TxJobServices } from '../../src/tx-job-services';

describe('Job Service Class Testing', () => {

  const from = {
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
  it('tx-job-service-serialize.spec.ts: simple deserialize connctors test', () => {
    logger.info('tx-job-service-serialize.spec.ts: simple deserialize connctors test')

    let service = (new TxJobServices(new TxJob('job-1'))).upJSON(from)

    let i = 0;
    for (let c of service.getConnectors().entries()) {
      logger.info(`checking: ${from.connectors[i]['service']} equal to ${c[0]}`)
      assert.deepEqual(from.connectors[i]['service'], c[0])

      logger.info(`checking: ${JSON.stringify(from.connectors[i]['connector'])} equal to ${JSON.stringify(c[1])}`)
      assert.deepEqual(from.connectors[i]['connector'], c[1])

      i++;
    }

  }).timeout(2000);

  /**
   */
  it('tx-job-service-serialize.spec.ts: simple serialize connctors test', () => {
    logger.info('tx-job-service-serialize.spec.ts: simple serialize connctors test')

    let connectors = [
        {"service": "service-a", "connector": {"mode": "route", "host": "localhost", "port": "3001", "path": "route1"}},
        {"service": "service-b", "connector": {"mode": "route", "host": "localhost", "port": "3002", "path": "route2"}},
        {"service": "service-c", "connector": {"mode": "queue", "host": "service-a", "port": "0000", "path": "queue1"}}
      ]    
        
    assert.deepEqual((new TxJobServices(new TxJob('job-1'))).upJSON(from).toJSON()['connectors'], connectors)    

  }).timeout(2000);

});