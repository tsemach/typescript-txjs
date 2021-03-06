import createLogger from 'logging';
const logger = createLogger('Job-Symbol-Test');

import 'mocha';
import {expect} from 'chai';

import {TxSinglePointRegistry} from '../../src/tx-singlepoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

import {C1Component} from './C1.component';
import {C2Component} from './C2.component';
import {C3Component} from './C3.component';

describe('Job Class', () => {

  let a = 0;
  before(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        a = 1;
        resolve();
      }, 200);
    });
  });

  /**
   */

  class Names {
    static GITHUB_GIST_C1 = Symbol('JOB::SYMBOL::GITHUB_GIST_C1');
    static GITHUB_GIST_C2 = Symbol('JOB::SYMBOL::GITHUB_GIST_C2');
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

  it('check job-symbol.spec: running C1-C2 job chain by symbols', (done) => {
    
    new C1Component();
    new C2Component();

    let job = new TxJob('Job-1'); // or create througth the TxJobRegistry

    job.add(TxSinglePointRegistry.instance.get(Names.GITHUB_GIST_C1));
    job.add(TxSinglePointRegistry.instance.get(Names.GITHUB_GIST_C2));

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data.get(), undefined, 2));
        expect(data['head']['method']).to.equal("from C2Component");
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

});