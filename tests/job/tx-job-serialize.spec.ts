import createLogger from 'logging';
import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import {TxTask} from '../../src/tx-task';
import {TxJob} from '../../src/tx-job';

const logger = createLogger('Job-Serialize-Test');

describe('Job Class - Serialize', () => {

  class Names {
    static GITHUB_GIST_C1 = Symbol('GITHUB_GIST_C1');
    static GITHUB_GIST_C2 = Symbol('GITHUB_GIST_C2');
    static GITHUB_GIST_C3 = Symbol('GITHUB_GIST_C3');
  }

  class C1Component {
    mountpoint = TxMountPointRegistry.instance.create(Names.GITHUB_GIST_C1);

    constructor() {
      this.mountpoint.tasks().subscribe(
        (task) => {
          logger.info('[C1Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));


          this.mountpoint.reply().next(new TxTask({method: 'from C1Component', status: 'ok'}, task['data']));
        });
    }
  }

  class C2Component {
    mountpoint = TxMountPointRegistry.instance.create(Names.GITHUB_GIST_C2);

    constructor() {
      this.mountpoint.tasks().subscribe(
        (task) => {
          logger.info('[C2Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));


          this.mountpoint.reply().next(new TxTask({method: 'from C2Component', status: 'ok'}, task['data']));
        });
    }
  }

  class C3Component {
    mountpoint = TxMountPointRegistry.instance.create(Names.GITHUB_GIST_C3);

    constructor() {
      this.mountpoint.tasks().subscribe(
        (task) => {
          logger.info('[C3Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));


          this.mountpoint.reply().next(new TxTask({method: 'from C3Component', status: 'ok'}, task['data']));
        });
    }
  }

  /**
   */

  it('check toJSON | upJSON serialize', (done) => {

    new C1Component();
    new C2Component();

    let src = new TxJob(); // or create through the TxJobRegistry

    src.add(TxMountPointRegistry.instance.get(Names.GITHUB_GIST_C1));
    src.add(TxMountPointRegistry.instance.get(Names.GITHUB_GIST_C2));
    logger.info('[toJSON | upJSON] src.toJSON = ' + JSON.stringify(src.toJSON(), undefined, 2));

    let dst= new TxJob();

    dst.upJSON(src.toJSON());

    logger.info('[toJSON | upJSON] dst.toJSON = ' + JSON.stringify(dst.toJSON(), undefined, 2));
    assert.deepEqual(src.toJSON(), dst.toJSON());

    done();

  });

  it('check upJSON serialize with continue', (done) => {

    new C1Component();
    new C2Component();
    new C3Component();

    /**
     * load job where GITHUB_GIST_C1 is already called so need to continue from GITHUB_GIST_C2
     * @type {TxJob}
     */
    let job = new TxJob();
    let from = {
        "block": "Symbol(GITHUB_GIST_C1),Symbol(GITHUB_GIST_C2),Symbol(GITHUB_GIST_C3)",
        "stack": "Symbol(GITHUB_GIST_C2),Symbol(GITHUB_GIST_C3)",
        "trace": "Symbol(GITHUB_GIST_C1)",
        "single": false,
        "current": "Symbol(GITHUB_GIST_C2)"
    };
    let after = job.upJSON(from).toJSON();
    logger.info('[upJSON] after = ' + JSON.stringify(after, undefined, 2));

    expect(from.stack).to.equal(after['stack']);
    expect(from.trace).to.equal(after['trace']);
    expect(from.block).to.equal(after['block']);
    expect(from.single).to.equal(after['single']);
    expect(from.current).to.equal(after['current']);

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
    
});