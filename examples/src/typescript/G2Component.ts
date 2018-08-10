/**
 * A TypeScript module usng GitHub API
 */
import { TxMountPoint, TxMountPointRegistry, TxTask } from 'rx-txjs';

export class G2Component {
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::G2');
  reply: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        console.log('[G2Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          

        // G2 got a task then send reply to mountpoint.
        let M2 = TxMountPointRegistry.instance.get('GITHUB::G2');

        M2.reply().next(new TxTask('from G2', '', task['data']));
      }
    )

    this.mountpoint.reply().subscribe(
      (reply) => {
        console.log('[G2Component:reply] got reply = ' + JSON.stringify(reply, undefined, 2));

        this.reply = reply;
      }
    )  

  }

  getReply() {
    return JSON.stringify(this.reply);
  }

}  
