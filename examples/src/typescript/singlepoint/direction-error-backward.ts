import { TxSinglePointRegistry, TxJob, TxTask, TxJobExecutionOptions } from "rx-txjs";

import E1Component from './E1.component'
import E2Component from './E2.component'
import E3Component from './E3.component'

new E1Component();
new E2Component();
new E3Component();

const enum TxDirection {
  forward = 1,
  backward,
}

let count = 0;
let job = new TxJob('job-1');

job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E1'));
job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E2'));
job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::E3'));

job.getIsCompleted().subscribe(
  (data) => {
    console.log('[tx-job-execute-error.spec:data] ERROR: job.getIsCompleted: should not come here when error is occur - data:' + JSON.stringify(data, undefined, 2));
  },
  async (error) => {
    console.log('[tx-job-execute-error.spec:error] job.getIsCompleted: complete running error all - data:' + JSON.stringify(error, undefined, 2));

  });

job.getOnError().subscribe(
  (data) => {
    console.log('[tx-job-execute-error-direction.spec:error] job.getOnError: data = ' + JSON.stringify(data, undefined, 2));
    count++;
    if (count === 1) {
      console.log('getOnError: count === 1: ', count)
    }
    if (count === 2) {
      console.log('getOnError: count === 2: ', count)
    }
    if (count === 3) {
      console.log('getOnError: count === 3: ', count)
    }
  }
);

job.execute(new TxTask({
    method: 'create',
    direction: 'backward'
  },
  {something: 'more data here'}
  ),
  {
    error: {direction: <any>TxDirection.backward}
  } as TxJobExecutionOptions
);