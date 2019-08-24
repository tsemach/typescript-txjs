import { TxTask } from './tx-task';
import { TxSubject } from './tx-subject';
import { TxMountPoint } from "./tx-mountpoint";

export enum TxMountPointWrapperEnum {
  TASKS,
  REPLY,
}

export class TxMountPointWrapper extends TxSubject<any> {  
  
  constructor(private mountpoint: TxMountPoint, private origin: TxSubject<any>, private mode: TxMountPointWrapperEnum) {
    super(); 
  }

  subscribe(...args: any[]) {
    // this when the receiver subscribe on the task
    if (this.mode === TxMountPointWrapperEnum.TASKS) {
      return this.origin.subscribe(...args);
    }

    // this when the sender subscribe on the reply
    if (this.mode === TxMountPointWrapperEnum.REPLY) {
      return this.origin.subscribe(...args);
    }
  }

  next(task: TxTask<any>) {    
    // this when the sender send the task, need to take the reply subject and add it to the task.
    if (this.mode === TxMountPointWrapperEnum.TASKS) {
      if ( ! task.isReply() ) {
        task.setReply(this.mountpoint.reply().getOrigin('FROM TASKS'));
      }
      return this.origin.next(task);
    }

    // this when the receiver send the task, 
    // receiver is not allow to use the mountpoint reply directlry. it need to use the task object
    if (this.mode === TxMountPointWrapperEnum.REPLY) {
      this.origin.next(task);
      //throw Error(`Can't call next direct on mountpoint ${this.mountpoint.name} reply, use task.getReply().next(..)`);
    }
  }

  error(err: TxTask<any>) {
    // this when the sender send the task, need to take the reply subject and add it to the task.
    if (this.mode === TxMountPointWrapperEnum.TASKS) {
      if ( ! err.isReply() ) {
        err.setReply(this.mountpoint.reply().getOrigin());
      }
      return this.origin.error(err);      
    }

    // this when the receiver send the task, 
    // receiver is not allow to use the mountpoint reply directlry. it need to use the task object
    if (this.mode === TxMountPointWrapperEnum.REPLY) {
      this.origin.error(err);
      //throw Error(`Can't call next direct on mountpoint ${this.mountpoint.name} reply, use task.getReply().next(..)`);
    }
  }

  getOrigin(from?: string) {
    return this.origin;
  }
}
