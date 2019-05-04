import createLogger from 'logging'; 
const logger = createLogger('DoublePoint');

import { TxMountPoint } from './tx-mountpoint';
import { TxSinglePoint } from "./tx-singlepoint";
import { TxJobComponentOptions, TxJobComponentOptionsChecker, defaultComponentOptions } from './tx-job-component-options';
import { TxJob } from './tx-job';

export class TxDoublePoint implements TxMountPoint {
  type = 'TxDoublePoint';

  private _name: string | Symbol;
  private _job: TxJob = null;

  private _sender: TxSinglePoint<TxMountPoint>; // mount point use to send from me to others
  private _recver: TxSinglePoint<TxMountPoint>; // mount point use to recv from others to me  

  _options = defaultComponentOptions;

  constructor(_sender: TxMountPoint, _suffix = '') {
    this._name = _sender.name;

    let fullname = _sender.name;
    if (_suffix !== '') {
      fullname = _sender.name + ':' + _suffix
    }

    this._sender = <TxSinglePoint<TxMountPoint>>_sender
    this._recver = new TxSinglePoint<TxMountPoint>(fullname);
    this._recver.setFrom(this)
  }

  get name() {
    if (typeof this._name === 'string') {
      return this._name;
    }
    return this._name.toString();
  }

  tasks() {
    return this._sender.tasks();
  }

  reply() {    
    return this._recver.tasks();
  }

  undos() {
    return this._sender.undos();
  }

  set options(_options: TxJobComponentOptions) {
    if (_options) {
      this.checkOptions(_options);
      this._options = _options;
    }
  }
  
  get options() {
    return this._options;
  }

  get sender() {
    return this._sender;
  }

  private checkOptions(_options: TxJobComponentOptions) {
    if ( ! _options ) {
      return;
    }

    if (TxJobComponentOptionsChecker.isWait(_options) && TxJobComponentOptionsChecker.isWaitFor(_options)) {
      throw Error('ERROR: component option validation error, wait can\'t be true with waitfor to some components');
    }
  }

  get job() {
    return this._job;
  }

  isWait() {
    return TxJobComponentOptionsChecker.isWait(this.options);
  }

  // subscribe(job: TxJob) {   
  //   logger.info(`[TxDoublePoint:subscribe] [${job.getName()}] going to add '${this.name}' mount point`);

  //   console.log(`TxDoublePoint: IN subscribe: txMountPoint = ${this.name.toString()}`);    
  //   logger.info(`TxDoublePoint: IN subscribe: dp.recver.name = ${this.recver.name.toString()}`);  
        
  //   this._job = job;
  //   const subscribed = this.reply().subscribe(
  //     async (task) => {    
  //       await this.subscribeCB(task);
  //     },
  //     async (error) => {
  //       await job.errorCB(error, this);
  //     },
  //     () => {
  //       logger.info(`[TxDoublePoint:subscribe] [${job.getName()}] complete is called`)
  //     }
  //   );

  //   return subscribed;
  // }

  // async subscribeCB(task) {
  //   console.log(`TxDoublePoint: IN subscribe: BEFORE CALL TO JOB txMountPoint = ${this.name.toString()}`);    
  //   await this.job.subscribeCB(task, this);
  // }
      
  

}