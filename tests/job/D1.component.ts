
import { TxComponent } from '../../src/tx-component';
import {TxMountPointRegistry} from '../../src/tx-mountpoint-registry';
import { TxTask } from '../../src/tx-task';

@TxComponent({
  selector: 'GITHUB::GIST::D1',
  tasks: 'tasks',
  undos: 'undos'
})
export class D1Component {
  property = "property";
  hello: string;
  constructor() {
      console.log("[D1Component:constructor] in origin constructor");
      //this.hello = m;
  }

  tasks(data) {
    console.log('[D1Component:tasks] is called, data = ' + JSON.stringify(data));
    this.mountpoint().reply().next(new TxTask('undo from C1', 'ok', data['data']))
  }

  undos(data) {
    console.log('[D1Component:undos] is called, data = ' + JSON.stringify(data));
  }
}

// let d = new D1Component("world")
// //d.sayHello({method: 'create', data: {value: 'some data here'}});

// let mp = TxMountPointRegistry.instance.get('GITHUB::GIST::C1');
// mp.reply().next({data: 'This is WORKING!!'});

// let g = new D1Component("world")
// console.log("after ner GReeter " + JSON.stringify(g));

// g.sayHello({method: 'create', data: {value: 'some data here'}});

//g.tasks({method: 'create', data: {value: 'some data here'}});
