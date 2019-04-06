import { C1Component } from './C1.component';
import { C2Component } from './C2.component';
import { C3Component } from './C3.component';
import { TxJob, TxSinglePointRegistry, TxJobRegistry, TxTask, TxJobExecutionOptions } from 'rx-txjs';

import persist from './job-repository'

new C1Component()
new C2Component()
new C3Component()

const job = new TxJob('job-1')

job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C1'))
job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C2'))
job.add(TxSinglePointRegistry.instance.get('GITHUB::GIST::C3'))

async function save() {
  await persist.save(job.getUuid(), job.toJSON(), job.getName())
} 

async function doPersist() {
  TxJobRegistry.instance.setPersistDriver(persist);

  await job.execute(new TxTask({
        method: 'create',
        status: ''
      }, 
      {something: 'more data here'},
    ),
    {
      persist: {ison: true},
      execute: {until: 'GITHUB::GIST::C2'}
    } as TxJobExecutionOptions
  );        

   setTimeout(() => {
     console.log('MAIN.TS: Going to rebuild job -', job.getUuid())
     const repeat = TxJobRegistry.instance.rebuild(job.getUuid())

   }, 2000)
}

//save();

doPersist()
