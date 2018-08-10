
const txjs = require('rx-txjs');

/**
 * this part is just for register the component in the registry
 * The component can be a singleton and initiate some how during 
 * system initialization as long it regiter himself with the registry
 */
require('./G1Component');
require('./G2Component');

class GitHubJob extends txjs.TxJob {
  constructor(_name) {
    super(_name);

    this.add(txjs.TxMountPointRegistry.instance.get('GITHUB::G1'));
    this.add(txjs.TxMountPointRegistry.instance.get('GITHUB::G2'));    
  }
}

let job = new GitHubJob('GitHubJob');

job.execute(new txjs.TxTask(
  'github job',
  '',
  {something: 'more data here'})
);



