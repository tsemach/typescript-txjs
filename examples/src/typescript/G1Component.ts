/**
 * A TypeScript module usng GitHub API
 */
import { TxMountPoint, TxMountPointRegistry, TxTask } from 'rx-txjs';

export class G1Component {
  mountpoint = TxMountPointRegistry.instance.create('GITHUB::G1');
  reply: any;

  constructor() {
    this.mountpoint.tasks().subscribe(
      (task) => {
        console.log('[G1Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          

        // G1 got a task then send reply to mountpoint.
        let M1 = TxMountPointRegistry.instance.get('GITHUB::G1');

        M1.reply().next(new TxTask('from G1', '', task['data']));
      }
    )

    this.mountpoint.reply().subscribe(
      (reply) => {
        console.log('[G1Component:reply] got reply = ' + JSON.stringify(reply, undefined, 2));

        this.reply = reply;
      }
    )  

  }

  getReply() {
    return JSON.stringify(this.reply);
  }

}  
