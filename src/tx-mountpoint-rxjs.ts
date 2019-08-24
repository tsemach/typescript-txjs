import { TxTask } from './tx-task';
import { TxSubject } from './tx-subject';
import { TxMountPoint } from "./tx-mountpoint";

enum TxMountPointRxJSWrapperEnum {
  TASKS,
  REPLY,
}

class TxMountPointRxJSWrapper<T> extends TxSubject<T> {  
  
  constructor(private mountpoint: TxMountPointRxJS<T>, private origin: TxSubject<T>, private mode: TxMountPointRxJSWrapperEnum) {
    super(); 
  }

  subscribe(...args: any[]) {
    // this when the receiver subscribe on the task
    if (this.mode === TxMountPointRxJSWrapperEnum.TASKS) {
      return this.origin.subscribe(...args);
    }

    // this when the sender subscribe on the reply
    if (this.mode === TxMountPointRxJSWrapperEnum.REPLY) {
      return this.origin.subscribe(...args);
    }
  }

  next(task: TxTask<any>) {    
    // this when the sender send the task, need to take the reply subject and add it to the task.
    if (this.mode === TxMountPointRxJSWrapperEnum.TASKS) {
      if ( ! task.isReply() ) {
        task.setReply(this.mountpoint.reply().getOrigin('FROM TASKS'));
      }
      return this.origin.next(task);
    }

    // this when the receiver send the task, 
    // receiver is not allow to use the mountpoint reply directlry. it need to use the task object
    if (this.mode === TxMountPointRxJSWrapperEnum.REPLY) {
      this.origin.next(task);
      //throw Error(`Can't call next direct on mountpoint ${this.mountpoint.name} reply, use task.getReply().next(..)`);
    }
  }

  error(err: TxTask<any>) {
    // this when the sender send the task, need to take the reply subject and add it to the task.
    if (this.mode === TxMountPointRxJSWrapperEnum.TASKS) {
      if ( ! err.isReply() ) {
        err.setReply(this.mountpoint.reply().getOrigin());
      }
      return this.origin.error(err);      
    }

    // this when the receiver send the task, 
    // receiver is not allow to use the mountpoint reply directlry. it need to use the task object
    if (this.mode === TxMountPointRxJSWrapperEnum.REPLY) {
      this.origin.error(err);
      //throw Error(`Can't call next direct on mountpoint ${this.mountpoint.name} reply, use task.getReply().next(..)`);
    }
  }

  getOrigin(from?: string) {
    return this.origin;
  }
}

/**
 * TxMountPoint: class is usually used by a component. 
 *
 * It is a meeting point between two totally different components.
 * It support two communication between components.
 *
 * A component receive task by the mount-point's tasks Subject and return reply by reply subject.
 */
export class TxMountPointRxJS<T> implements TxMountPoint {
   type = 'TxMountPointRxJS';

  _tasks = new TxSubject<T>();  
  _reply = new TxMountPointRxJSWrapper<T>(this, new TxSubject<T>(), TxMountPointRxJSWrapperEnum.REPLY);
  _undos = new TxSubject<T>();

  constructor(private _name: string | Symbol) {
  }

  get name() {
    if (typeof this._name === 'string') {
      return this._name;
    }
    return this._name.toString();
  }

  /**
   * Use this subject to send back reply of some tasks.
   * @returns {TxSubject<any>}
   */
  reply(): TxMountPointRxJSWrapper<T> {
    return this._reply;
  }

  /**
   * Use this subject to receive some task to do
   * then reply on the reply subject about the result.
   * @returns {TxSubject<TxTask<any>>}
   */
  tasks(): TxSubject<T> {
    return this._tasks;
  }

  undos(): TxSubject<T> {
    return this._undos;
  }

  setFrom(from: T) {
    this._tasks.setFrom(from);
    this._reply.setFrom(from);
    this._undos.setFrom(from);    
  }
  
  adjust(from: TxMountPointRxJS<T>) {
    this._name = from._name;

    this._tasks = new TxMountPointRxJSWrapper(this, from._tasks, TxMountPointRxJSWrapperEnum.TASKS);
    this._undos = new TxMountPointRxJSWrapper(this, from._undos, TxMountPointRxJSWrapperEnum.TASKS);;
    this._reply = new TxMountPointRxJSWrapper(this, new TxSubject<T>(), TxMountPointRxJSWrapperEnum.REPLY);

    return this;
  }

  // setOptions(options: TxMountPointGetOptions) {
  //   if (options.reply === TxMountPointGetOptionsEnum.PUBLIC) {
  //     console.log('IIIIN SET OPTION : PUBNLIC')
  //     this._reply.setMode(TxMountPointRxJSWrapperEnum.PUBLIC);
  //   }
  // }
}

