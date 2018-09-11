/**
 * A TypeScript module usng GitHub API
 */
import { 
  TxJob, 
  TxMountPointRegistry, 
  TxTask } from 'rx-txjs';

/**
 * this part is just for register the component in the registry
 * The component can be a singleton and initiate some how during 
 * system initialization as long it regiter himself with the registry
 */
import { D1Component } from './D1.component';
import { D2Component } from './D2.component';

new D1Component();
new D2Component();

export class DecoratorJob extends TxJob {
  constructor(_name) {
    super(_name);

    this.add(TxMountPointRegistry.instance.get('DECORATOR::D1'));
    this.add(TxMountPointRegistry.instance.get('DECORATOR::D2'));    
  }
}

let job = new DecoratorJob('GitHubJob');

job.execute(new TxTask(
  {name: 'decorator job', status: ''},
  {something: 'decorator more data here'}
));

job.undo(new TxTask(
  {name: 'decorator undos', status: ''},
  {something: 'decorator undos data here'}
));

