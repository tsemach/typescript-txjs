import createLogger from 'logging';
const logger = createLogger('Record-MongoDB-Example');

import {
  TxRecordPersistMongoDB,
  TxJobRegistry,
  TxMountPointRegistry,
  TxJobExecutionOptions,
  TxJob,
  TxTask
} from 'rx-txjs';

import { C1Component } from "./C1.component";
import { C2Component } from "./C2.component";

async function run() {
  logger.info('[run] example of mongodb recorder');

  // create an instance of the mogodb implementation and register it with the job registry
  let recorder = new TxRecordPersistMongoDB();
  await recorder.connect('mongodb://localhost:27017');
  TxJobRegistry.instance.setRecorderDriver(recorder);

  // just make C1Component and C1Component 'floating in the air'
  new C1Component();
  new C2Component();

  // define the job
  let job = new TxJob('job-1'); // or create through the TxJobRegistry

  job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
  job.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));

  job.getIsCompleted().subscribe(
    async (data) => {
      console.log('[reun] job.getIsCompleted: complete running all tasks - data:' + JSON.stringify(data, undefined, 2));
      let result;

      // get last execution id, sequence point to the last execute
      let id = job.getExecutionId();

      // this expecting to read the result of the current component execution.
      result = await recorder.asking(id);
      console.log(`[run] complete, result of ${JSON.stringify(id)} is: ${JSON.stringify(result, undefined, 2)}`);

      // this expecting to read both C1 and C2 data.
      id.sequence = 0;
      result = await recorder.asking(id);
      console.log(`[run] complete, result of ${JSON.stringify(id)} is: ${JSON.stringify(result, undefined, 2)}`);
    });

  job.execute(new TxTask({
      method: 'create',
      status: ''
    },
    {something: 'more data here'}
    ),
    {
      persist: {ison: false},
      execute: {record: true}
    } as TxJobExecutionOptions
  );

}

logger.info('ATTENTION: Make sure you have mongodb running, you can use docker:');
logger.info('docker run --name mongodb -p 27017:27017 -v ~/data:/data/db -d mongo');
logger.info('');

run();
