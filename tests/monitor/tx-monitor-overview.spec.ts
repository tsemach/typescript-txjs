
const fs = require('fs');

import createLogger from 'logging';
const logger = createLogger('Monitor-Overview');

import 'mocha';
import {expect, assert} from 'chai';

const request = require('request');
import waitOn = require('wait-on');

import { TxJob } from '../../src';
import { TxTask } from '../../src';
import { TxMountPointRegistry } from '../../src';
import { TxJobRegistry } from './../../src/tx-job-resgitry';
import { TxJobServicesComponent } from '../../src/tx-job-services-component';

import TxMonitor from '../../src/tx-monitor';
import '../../src/tx-monitor-server.component';

import './monitor-client.component';
import './C1.component';
import './C2.component';

new TxJobServicesComponent().init();  

let registry = TxJobRegistry.instance;

TxMountPointRegistry.instance.create('GITHUB::APIS::C1');
TxMountPointRegistry.instance.create('GITHUB::APIS::C2');
TxMountPointRegistry.instance.create('GITHUB::APIS::C3');
TxMountPointRegistry.instance.create('GITHUB::GIST::C3');
TxMountPointRegistry.instance.create('GITHUB::GIST::C4');

let job1 = new TxJob('Job-1');

job1.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
job1.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
job1.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
job1.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C4'));

let job2 = new TxJob('Job-2');

job2.add(TxMountPointRegistry.instance.get('GITHUB::APIS::C1'));
job2.add(TxMountPointRegistry.instance.get('GITHUB::APIS::C2'));
job2.add(TxMountPointRegistry.instance.get('GITHUB::APIS::C3'));

let overview = {
  "name": "github",
  "jobs": [
    {
      "name": "Job-1",
      "components": [
        {
          "name": "GITHUB::GIST::C1"
        },
        {
          "name": "GITHUB::GIST::C2"
        },
        {
          "name": "GITHUB::GIST::C3"
        },
        {
          "name": "GITHUB::GIST::C4"
        }
      ]
    },
    {
      "name": "Job-2",
      "components": [
        {
          "name": "GITHUB::APIS::C1"
        },
        {
          "name": "GITHUB::APIS::C2"
        },
        {
          "name": "GITHUB::APIS::C3"
        }
      ]
    }
  ]
}

describe('tx-monitor-overview.spec.ts: load monitor overview from job registry test', () => {
  
  it('tx-monitor-overview.spec.ts: load monitor overview from job registry test', async () => {
    let jobs;

    logger.info('registry.getComponents().size = ', registry.getJobs().size);    

    jobs = <Map<string, Set<string>>>registry.getJobs();
    expect(jobs.size).to.equal(2);    

    // this part check the whole map
    //--------------------------------------------------------------------------------------------------------------------------
    let components1 = jobs.get('Job-1');
    logger.info('components1.size = ', components1.size);

    expect(components1.size).to.equal(4);
    assert.isOk((<Set<string>>components1).has('GITHUB::GIST::C1'), '\'GITHUB::GIST::C1\' is not in the job\'s components set');
    assert.isOk((<Set<string>>components1).has('GITHUB::GIST::C2'), '\'GITHUB::GIST::C2\' is not in the job\'s components set');
    assert.isOk((<Set<string>>components1).has('GITHUB::GIST::C3'), '\'GITHUB::GIST::C3\' is not in the job\'s components set');
    assert.isOk((<Set<string>>components1).has('GITHUB::GIST::C4'), '\'GITHUB::GIST::C4\' is not in the job\'s components set');
    
    let components2 = jobs.get('Job-2');
    logger.info('components2.size = ', components2.size);

    expect(components2.size).to.equal(3);
    assert.isOk(components2.has('GITHUB::APIS::C1'), '\'GITHUB::APIS::C1\' is not in the job\'s components set');
    assert.isOk(components2.has('GITHUB::APIS::C2'), '\'GITHUB::APIS::C2\' is not in the job\'s components set');
    assert.isOk(components2.has('GITHUB::APIS::C3'), '\'GITHUB::APIS::C3\' is not in the job\'s components set');
    //--------------------------------------------------------------------------------------------------------------------------

    // this part check each job seperatlly
    //--------------------------------------------------------------------------------------------------------------------------
    jobs = registry.getComponents('Job-1');
    logger.info('registry.getComponents(\'Job-1\').size = ', registry.getComponents('Job-1').size);    

    expect((<Set<string>>jobs).size).to.equal(4);    
    assert.isOk((<Set<string>>jobs).has('GITHUB::GIST::C1'), '\'GITHUB::GIST::C1\' is not in the job\'s components set');
    assert.isOk((<Set<string>>jobs).has('GITHUB::GIST::C2'), '\'GITHUB::GIST::C2\' is not in the job\'s components set');
    assert.isOk((<Set<string>>jobs).has('GITHUB::GIST::C3'), '\'GITHUB::GIST::C3\' is not in the job\'s components set');
    assert.isOk((<Set<string>>jobs).has('GITHUB::GIST::C4'), '\'GITHUB::GIST::C4\' is not in the job\'s components set');
    
    jobs = registry.getComponents('Job-2');    
    expect((<Set<string>>jobs).size).to.equal(3);
    assert.isOk((<Set<string>>jobs).has('GITHUB::APIS::C1'), '\'GITHUB::APIS::C1\' is not in the job\'s components set');
    assert.isOk((<Set<string>>jobs).has('GITHUB::APIS::C2'), '\'GITHUB::APIS::C2\' is not in the job\'s components set');
    assert.isOk((<Set<string>>jobs).has('GITHUB::APIS::C3'), '\'GITHUB::APIS::C3\' is not in the job\'s components set');
    //-------------------------------------------------------------------------------------------------------------------------

  })

  it('tx-monitor-overview.spec.ts: check monitor overview check', async () => {      
    logger.info('tx-monitor-overview.spec.ts: check monitor overview check');
      
    let expectedOverview = JSON.parse(JSON.stringify(overview));
    let loaddedOverview = TxMonitor.getOverview('github');
    console.log("jobsArray.components = ", JSON.stringify(loaddedOverview));
    console.log("jobsArray.components = ", JSON.stringify(expectedOverview));
    assert.deepEqual(expectedOverview, loaddedOverview);
  });
});

