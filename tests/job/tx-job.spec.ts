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

describe('Job Class', () => {

  /**
   */

  it('check running C1-C2-C3 job chain', () => {
    
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();
    
    let job = new TxJob(); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-test:execute] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok");        
      });                
          
    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );        

  });

  it('check C1-C2-C3 toJSON begining', () => {
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();

    let job = new TxJob('GitHub'); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    console.log('toJSON = ' + JSON.stringify(job.toJSON(), undefined, 2));

    let json = job.toJSON();

    expect(json.name).to.equal('GitHub');
    expect(json.stack).to.equal('GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3');
    expect(json.block).to.equal("GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3");
    expect(json.trace).to.equal('');
    expect(json.current).to.equal('');       
  });

  it('check C1-C2-C3 toJSON middle', () => {
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();

    let job = new TxJob('GitHub'); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
    
    console.log('toJSON = ' + JSON.stringify(job.toJSON(), undefined, 2));

    // TODO: need to add step - running just one step
    let json = job.toJSON();

    expect(json.name).to.equal('GitHub');
    expect(json.stack).to.equal('GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3');
    expect(json.block).to.equal("GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3");
    expect(json.single).to.equal(false);
    expect(json.trace).to.equal('');
    expect(json.current).to.equal('');    
  });

  it('check C1-C2-C3 upJSON with execute', (done) => {
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();

    let job = new TxJob();
    let from = {
      "name": "GitHub",
      "block": "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      "stack": "GITHUB::GIST::C1,GITHUB::GIST::C2,GITHUB::GIST::C3",
      "single": 0,
      "trace": "",
      "current": ""
    }
    let after = job.upJSON(from).toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.single).to.equal(after['single']);
    expect(from.block).to.equal(after['block']);
    expect(from.current).to.equal(after['current']);

    job.getIsCompleted().subscribe(
      (data) => {
        logger.info('[job-test:upJSON] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));        
        expect(data['head']['method']).to.equal("from C3");
        expect(data['head']['status']).to.equal("ok"); 
        done();       
      });                
          
    job.execute(new TxTask({
        method: 'create',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });

  it('check C1-C2-C3 upJSON with continue', () => {
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

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });

  it('check C1-C2-C3 upJSON with continue', () => {
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

    console.log('job = ' + JSON.stringify(job.toJSON(), undefined, 2));
    let after = job.toJSON();

    expect(from.name).to.equal(after['name']);
    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);

    job.continue(new TxTask({
        method: 'continue',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });
  
  it('check C1-C2-C3 upJSON with step ', () => {
    let C1 = new C1Component();
    let C2 = new C2Component();
    let C3 = new C3Component();

    let job = new TxJob();

    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));
    
    job.step(new TxTask({
        method: 'step-1',
        status: ''
      },
      {something: 'more data here'})
    );

    job.step(new TxTask({
      method: 'step-2',
      status: ''
      },
      {something: 'more data here'})
    );

    job.step(new TxTask({
        method: 'step-3',
        status: ''
      },
      {something: 'more data here'})
    );
    
  });
});