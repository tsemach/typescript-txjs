/**
 * A JavaScript module usng GitHub API
 */
const txjs = require('rx-txjs');

class G2Component {

  constructor() {
    this.mountpoint = txjs.TxMountPointRegistry.instance.create('GITHUB::G2');
    this.reply = {}
  
    this.mountpoint.tasks().subscribe(
      (task) => {
        console.log('[G2Component:tasks] got task = ' + JSON.stringify(task, undefined, 2));          

        // G1 got a task then send reply to mountpoint.
        let M1 = txjs.TxMountPointRegistry.instance.get('GITHUB::G2');

        M1.reply().next(new txjs.TxTask('from G1', '', task['data']));
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

module.exports = new G2Component();