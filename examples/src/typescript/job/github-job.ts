/**
 * A TypeScript module usng GitHub API
 */
import { TxJob, TxMountPoint, TxMountPointRegistry, TxTask } from 'rx-txjs';

/**
 * this part is just for register the component in the registry
 * The component can be a singleton and initiate some how during 
 * system initialization as long it regiter himself with the registry
 */
import { G1Component } from './G1Component';
import { G2Component } from './G2Component';

new G1Component();
new G2Component();

export class GitHubJob extends TxJob {
  constructor(_name) {
    super(_name);

    this.add(TxMountPointRegistry.instance.get('GITHUB::G1'));
    this.add(TxMountPointRegistry.instance.get('GITHUB::G2'));    
  }
}

let job = new GitHubJob('GitHubJob');

job.execute(new TxTask(
  {name: 'github job', status: ''},
  {something: 'more data here'})
);



