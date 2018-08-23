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
    static GITHUB_GIST_C1 = Symbol('GITHUB_GIST_C1');
    static GITHUB_GIST_C2 = Symbol('GITHUB_GIST_C2');
  }

  class C1Component {
    mountpoint = TxMountPointRegistry.instance.create(Names.GITHUB_GIST_C1);

    constructor() {
      this.mountpoint.tasks().subscribe(
        (task) => {
          logger.info('[C1Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));


          this.mountpoint.reply().next(new TxTask('from C1Component', 'ok', task['data']));
        });
    }

  }

  class C2Component {
    mountpoint = TxMountPointRegistry.instance.create(Names.GITHUB_GIST_C2);

    constructor() {
      this.mountpoint.tasks().subscribe(
        (task) => {
          logger.info('[C2Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));


          this.mountpoint.reply().next(new TxTask('from C2Component', 'ok', task['data']));
        });
    }

  }


  it('check running C1-C2 job chain by symbols', (done) => {
    
    let C1 = new C1Component();
    let C2 = new C2Component();

    let job = new TxJob(); // or create througth the TxJobRegistry

    job.add(TxMountPointRegistry.instance.get(Names.GITHUB_GIST_C1));
    job.add(TxMountPointRegistry.instance.get(Names.GITHUB_GIST_C2));

    job.getIsCompleted().subscribe(
      (data) => {
        console.log('[job-execute-test] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
        expect(data['method']).to.equal("from C2Component");
        expect(data['status']).to.equal("ok");
        done();
      });                

    job.execute(new TxTask(
      'create',
      '',
      {something: 'more data here'})
    );        
  });

});