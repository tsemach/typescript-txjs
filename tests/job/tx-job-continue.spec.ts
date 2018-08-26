import createLogger from 'logging';
import 'mocha';
import {expect} from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';

const logger = createLogger('Job-Test');

describe('Job Class - Continue', () => {

  /**
   */

  it('check C1-C2-C3 upJSON with continue', (done) => {
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();

    let job = new TxJob();
    let from = {
      "name": "GitHub",
      "block": "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      "stack": "GITHUB::GIST::C2,GITHUB::GIST::C3",
      "trace": "GITHUB::GIST::C1",
      "single": false,
      "current": "GITHUB::GIST::C2"
    }
    let after = job.upJSON(from).toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);

    job.getIsCompleted().subscribe(
      (data) => {
        logger.debug('[job-continue-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from C3");
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

  it('check C1-C2-C3 toJSON with continue', (done) => {
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();

    let job = new TxJob();
    let from = {
      "name": "GitHub",
      "block": "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      "stack": "GITHUB::GIST::C2,GITHUB::GIST::C3",
      "trace": "GITHUB::GIST::C1",
      "single": false,
      "current": "GITHUB::GIST::C2"
    }
    job.upJSON(from);

    logger.info('job = ' + JSON.stringify(job.toJSON(), undefined, 2));
    let after = job.toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);

    interface Head {
      method: string;
      status: string;
    }

    job.getIsCompleted().subscribe(
      (task) => {        
        logger.info('[job-continue-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(task, undefined, 2));        
        expect(task['head']['method']).to.equal("from C3");
        expect(task['head']['status']).to.equal("ok");
        done();
      });                

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });
    
});