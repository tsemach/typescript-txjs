import { TxSinglePointRegistry, TxJob, TxTask } from "rx-txjs";

class C1Component {
  private singlepoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::C1');

  constructor() {
    this.singlepoint.tasks().setCallbacks(this.run, this.error);
  }

  run(task: TxTask<any>) {
    console.log('[C1Component:tasks] got task = ' + JSON.stringify(task.get(), undefined, 2));                  

    if (task.getHead().direction === 'forward') {
      task.reply().error(new TxTask({method: 'from E4', direction: task.getHead().direction, status: 'ERROR'}, task['data']))

      return;
    }    
  }

  error(error: TxTask<any>) {
    console.log('[C1Component:error] got error = ' + JSON.stringify(error.get(), undefined, 2));            
  }  
}  

new C1Component();
let singlepoint = TxSinglePointRegistry.instance.get('GITHUB::GIST::C1');

console.log('[set-callback]: singlepoint name is - \'' + singlepoint.name + '\'');

let task: TxTask<any>;

// C1Component.doit will called
task = new TxTask({from: 'example'}, {from: 'https://api.github.com/doit'});
singlepoint.tasks().next(task); 

// C1Component.error will called
task = new TxTask({from: 'example'}, {from: 'https://api.github.com/error'});
singlepoint.tasks().error(task);

