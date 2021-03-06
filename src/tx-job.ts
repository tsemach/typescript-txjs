import createLogger from 'logging'; 
const logger = createLogger('Job');
import _ = require('lodash');

import * as longUuid from 'uuid/v4';
import * as short from 'short-uuid';
const uuid = short();

import { TxTask } from "./tx-task";
import { Subject } from 'rxjs';
import { TxMountPoint } from './tx-mountpoint';
import { TxSinglePointRegistry } from './tx-singlepoint-registry';
import { TxJobRegistry } from './tx-job-resgitry';
import { TxJobJSON } from "./tx-job-json";
import { TxSubscribeOptions, defaultSubscribeOptions } from './tx-subscribe-options';
import { TxJobComponentOptions, defaultComponentOptions } from './tx-job-component-options';
import { TxJobExecutionOptions, TxJobExecutionOptionsChecker, defaultExecutionOptions } from "./tx-job-execution-options";
import { TxRecordPersistAdapter, TxRecordIndexSave } from "./tx-record-persist-adapter";
import { TxJobExecutionId } from "./tx-job-execution-id";
import { TxJobServices } from './tx-job-services';
import { TxSubscribe } from './tx-subscribe';
import { TxDoublePoint } from './tx-doublepoint';
import { TxDirection } from './tx-direction';
import { TxMultiPoint } from './tx-multipoint';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxSinglePoint } from './tx-singlepoint';

export class TxJob {
  private _isCompleted = new TxSubscribe<TxJob>(this);   // notify when the whole execution is completed.
  isStopped = new Subject();                // notify when execution reach to it's run-until component.
  onComponent = new TxSubscribe<TxJob>();   // notify the world on any coming in subscribe callback (reply from component).
  onError = new TxSubscribe<TxJob>();       // notify the world on any coming in subscribe callback (reply from component).

  uuid = uuid.new();

  stack = [];       // mountpoints needs to be run
  trace = [];       // mountpoints already run
  block = [];       // all the mountpoints added to this job, useful when need to reexecute the job
  subscribers = []; // a list of all the subscribes job is registered.

  error = false;
  single = false;
  revert = false;
  current = null;
  options = defaultExecutionOptions;  

  pointnumber = 0;
  executionId: TxJobExecutionId = {uuid: '', sequence: 0};
  recorder: TxRecordPersistAdapter;
  waiting = new Set<string>();

  services = new TxJobServices(this);

  constructor(private name: string) {
    if (name === '' || typeof name !== 'string') {
      throw Error('job name cah\'t be empty, add real name');
    }

    TxJobRegistry.instance.add(this.uuid, this);
    this.recorder = TxJobRegistry.instance.getRecorderDriver();
  }

  async subscribeCB(data: TxTask<any>, txMountPoint: TxMountPoint, options: TxSubscribeOptions) {    
    logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] got reply, data = ${JSON.stringify(data, undefined, 2)}`);
    logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] before shift to next task, stack.len = ${this.stack.length}`);

    if (this.error) {
      throw new Error(`[TxJob:subscribe] ERROR: job: ${this.name} is on error but got subscribe callback from a mountpoint`);
    }

    logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] going to delete ${txMountPoint.name.toString()} from waiting`);    
    // remove this comment when finish waitfor bug
    // this.waiting.delete(txMountPoint.name.toString());
    this.waiting.clear();

    if (this.isRecord(this.options)) {
      await this.record({reply: data}, 'update');
    }
    this.onComponent.next(new TxTask<{name: string}>({name: txMountPoint.name.toString()}, data));

    if (this.revert) {
      this.undoCB(data);

      return;
    }

    if (this.single) {
      this.getIsStopped().next(data);
    }

    if (this.isFinish()) {
      logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] complete running all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}, waiting.size = ${this.waiting.size}`);
      this.finish(data);

      return;
    }

    if (this.single) {
      if (TxJobExecutionOptionsChecker.isDestroy(this.options)) {
        logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] single step - going to destroy job \'${this.getUuid()}\', on ${this.current.name} mount point`);

        this.release();
      }
      return
    }

    let next: TxDoublePoint;
    do {
      // if stack.length == 0 then nothing to next but this.waitng.size > 0 then it mean
      // that there are still component outside, need to wait for them.
      if (this.waiting.size > 0 && this.stack.length === 0) {
        logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] nothing to next but still need to wait for components to completed, ${this.waiting.size}`);
        
        return;
      }

      /**
       * make the next move, get the next mountpoint from the stack,
       * and send the data to it's tasks subject.
       */            
      next = this.shift(options);      
      logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] going to run next task: ${next.name}`);

      if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
        await TxJobRegistry.instance.persist(this);
      }

      if (TxJobExecutionOptionsChecker.isUntil(this.options, next.name)) {
        logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] found execute.until, on ${next.name} mount point`);

        if ( ! TxJobExecutionOptionsChecker.isPersist(this.options) ) {
          await TxJobRegistry.instance.persist(this);
        }

        if (TxJobExecutionOptionsChecker.isDestroy(this.options)) {
          logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] going to destroy job \'${this.getUuid()}\', on ${next.name} mount point`);

          this.release();
        }

        this.getIsStopped().next(data);

        return;
      }

      if (this.isRecord(this.options)) {
        await this.record({tasks: data}, 'insert');
      }    

      this.waiting.add(next.name.toString());
      data.setReply(next.reply());

      setTimeout(async () => {
        this.publish(data, next);
      }, 0);

      logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] end of subscribe, ${next.name}`);

    } while ( ! next.isWait() )
  }

  async errorCB(task: TxTask<any>,  txMountPoint: TxMountPoint, options: TxSubscribeOptions) {
    let __name = TxJobRegistry.instance.getServiceName();

    logger.info(`[(${__name}):TxJob:errorCB] [${this.name}/${this.getUuid()}] got error, data = ${JSON.stringify(task, undefined, 2)}`);
    logger.info(`[(${__name}):TxJob:errorCB] [${this.name}/${this.getUuid()}] before shift to next error, trace.len = ${this.trace.length}`);

    // set error mode to true and rise onError event.
    if (this.error == false) {
      logger.info(`[(${__name}):TxJob:errorCB] [${this.name}/${this.getUuid()}] first time enter to error handler, remove current occuring the error`);

      this.trace.pop();
      this.error = true;
      this.services.setError();
    }
    this.onError.next(new TxTask<{name: string}>({name: <string>this.current.name}, task));
    
    // let isend = false;

    // switch (TxJobExecutionOptionsChecker.getErrorDirection(this.options)) {
    //   case TxDirection.forward:  isend = this.stack.length === 0; break;
    //   case TxDirection.backward: isend = this.trace.length === 0; break;
    // }

    // if (isend) {
    //   logger.info(`[(${__name}):TxJob:errorCB] [${this.name}/${this.getUuid()}] complete running errors all mount points, trace.length = ${this.trace.length}, stack.length = ${this.stack.length}`);
            
    //   this.services.error(task);
    //   this.isCompleted.error(task);
    //   this.notify(task);
    //   TxJobRegistry.instance.emit('job:error: ' + this.getUuid(), {job: this, task})

    //   return;
    // }    
    if (this.isErrorFinish()) {
      this.doErrorFinish(task);

      return;
    }

    this.current = this.shiftError(options);

    logger.info(`[(${__name}):TxJob:errorCB] [${this.name}/${this.getUuid()}] after pop this.currnet = ${this.current.name}`);

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    //task.setReply(txMountPoint.reply());
    task.setReply(this.current.reply());
    this.publishError(task, this.current);
  }

  subscribe(txMountPoint: TxMountPoint) { 
    const subscribed = txMountPoint.reply().subscribe(
      async (task: TxTask<any>, mountpoint: TxMountPoint, options: TxSubscribeOptions) => {        
        await this.subscribeCB(task, mountpoint, options);
      },
      async (error: TxTask<any>, mountpoint: TxMountPoint, options: TxSubscribeOptions) => {
        await this.errorCB(error, mountpoint, options);
      },
      () => {
        logger.info(`[TxJob:subscribe] [${this.name}/${this.getUuid()}] complete is called`)
      }
    );
   this.subscribers.push(subscribed);
  }

  /**
   * use when defining S2S. like: job.on('service').add('mountpoint')
   * @param serivce in case of S2S set the service of the following mountpoint
   */
  on(serivce: string) {
    return this.services.on(serivce);
  }
  
  /**
   * TxDoublePoint hold to TxSinglePoint:
   *  sender: user to send tasks from me to others
   *  recver: user to subscribe and receive from others to me
   * 
   * @param sender - the mountpoint use to send tasks by me to others
   */
  add(sender: TxMountPoint, options: TxJobComponentOptions = defaultComponentOptions) {
    const doublepoint = this.newDoublePoint(sender, options);

    if (this.isMultiPoint(sender)) {            
      const multipoint = <TxMultiPoint>sender;

      multipoint.names.forEach(name => {        
        const dp = this.newDoublePoint(TxMountPointRegistry.instance.get(name), options);

        this.subscribe(dp);
        multipoint.add(dp);        
      });
    }
    
    this.subscribe(doublepoint);
    this.stack.push(doublepoint);
    this.block.push(doublepoint);

    TxJobRegistry.instance.addComponent(this.name, doublepoint.name);
  }

  private newDoublePoint(sender: TxMountPoint, options?: TxJobComponentOptions) {
    let doublepoint = new TxDoublePoint(sender, this.uuid + ':' + ++this.pointnumber);
    doublepoint.options = options;

    return doublepoint;
  }

  private getDoublePoint(name: string | Symbol) {
    return _.find(this.block, (e) => { return e.name === name});
  }

  async execute(task: TxTask<any>, options: TxJobExecutionOptions = defaultExecutionOptions) {
    this.single = false;
    this.options = options;

    if (TxJobExecutionOptionsChecker.isService(this.options)) {
      this.setFromServices();
    }

    if (this.stack.length === 0) {
      logger.info(`[TxJob:execute] stack.length = 0`);  

      return;
    }

    // if come back from serialization with error flag on than call to
    // current component on error channel.
    if (this.error) {
      task.setReply(this.current.reply());
      this.current.tasks().error(task);

      return;
    }

    this.trace = [];
    let isOnePass = false;

    do {      
      if (this.stack.length === 0) {
        logger.info(`[TxJob:execute] [${this.name}] complete running all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}`);

        return;
      }

      this.current = this.shift();
      if (isOnePass && this.current.isWait()) {
        break;
      }

      logger.info(`[TxJob:execute] going to run ${this.current.name} mount point, wait: ${this.current.isWait()}`);

      if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
        await TxJobRegistry.instance.persist(this);
      }

      if (this.isRecord(options)) {
        this.genExecutionId();
        await this.record({tasks: task}, 'insert');
      }

      task.setReply(this.current.reply());
      this.waiting.add(this.current.name.toString());

      setTimeout( async () => {
        this.current.tasks().next(task)
      }, 0);
      isOnePass = true;

      logger.info(`[TxJob:execute] end calling to ${this.current.name} mount point, wait: ${this.current.isWait()}`);

    } while( ! this.current.isWait() );
  
    logger.info(`[TxJob:execute] [${this.name}] complete running all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}, waiting.size = ${this.waiting.size}`);
  } 

  async continue(data: TxTask<any>, options: TxJobExecutionOptions = defaultExecutionOptions) {
    this.single = false;
    this.options = options;

    if (this.stack.length === 0 && ! this.current) {
      logger.info(`[TxJob:continue] stack.length = 0 and no current job to run`);

      return;
    }

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    if (this.revert) {
      this.current.undos().next(data);

      return;
    }

    if (this.isRecord(options)) {
      await this.record({tasks: data}, 'insert');
    }

    // if come back from serialization with error flag on than call to component on error channel.
    data.setReply(this.current.reply());    
    if (this.error) {
      this.current.tasks().error(data);

      return;
    }        
    this.current.tasks().next(data);
  }

  /**
   * run the components step by step, after each step the control return to user
   * the call to step again to run next component.
   * @param data the data to pass to components
   * @param options
   */
  async step(data: TxTask<any>, options: TxJobExecutionOptions = defaultExecutionOptions) {
    this.single = true;
    this.options = options;
    if (this.stack.length === 0) {
      logger.info(`[TxJob:step] stack.length = 0`);  
      
      return;
    }
    this.current = this.shift();
    logger.info(`[TxJob:step] going to run next task: ${this.current.name}`);

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    if (this.isRecord(options)) {
      await this.record({tasks: data}, 'insert');
    }

    data.setReply(this.current.reply());
    this.current.tasks().next(data);
  }

  async undoCB(data: TxTask<any>) {
    logger.info(`[TxJob:undoCB] got reply from '${this.current.name}' method, data = ${JSON.stringify(data, undefined, 2)}`);
    logger.info(`[TxJob:undoCB] before shift to next task, stack.len = ${this.stack.length}`);
      
    if (this.stack.length > 0) {
      /**
       * make the next move, get the next mountpoint from the stack,
       * and send the data to it's tasks subject.
       */      
        let next = this.shift();
        logger.info(`[TxJob:undoCB] going to undo next task: ${next.name}`);

      if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
        await TxJobRegistry.instance.persist(this);
      }

      data.setReply(next.reply());
      next.undos().next(data);
      
      return;
    }
    logger.info(`[TxJob:undoCB] complete undo all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}`);
    this.finish(data);
  }

  async undo(data: TxTask<any>, direction: TxDirection = TxDirection.backward) {
    logger.info('[TxJob:undo]: direction = ' + direction);

    this.revert = true;
    this.stack = [];
    
    switch (direction) {
      case TxDirection.forward:  this.stack = this.trace; break;
      case TxDirection.backward: this.stack = this.trace.reverse(); break;
    }

    this.trace = [];
    this.current = this.stack.shift();

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    data.setReply(this.current.reply());
    this.current.undos().next(data);
  }

  /**
   * do error handling on all components
   * 
   * @param data 
   * @param options 
   */
  async errorAll(data, options: TxJobExecutionOptions = defaultExecutionOptions) {
    let __name = TxJobRegistry.instance.getServiceName();

    logger.info(`[(${__name}):TxJob:errorAll] called, this.stack.length = ${this.stack.length}, options = ${JSON.stringify(options)}`);      

    this.error = true;
    this.options = options;

    if (TxJobExecutionOptionsChecker.isService(this.options)) {      
      this.setFromServices();      
    }

    this.trace = []
    this.stack.forEach(e => {
      this.trace.push(e);
    });

    for (let i = 0; i < this.trace.length; i++) {
      logger.info(`[(${__name}):TxJob:errorAll] this.trace [${i}] = ${this.trace[i].name}`);
    }

    if (this.trace.length === 0) {
      logger.info(`[(${__name}):TxJob:errorAll] this.trace.length = 0`);  
      
      return;
    }

    this.current = this.trace.pop();        
    logger.info(`[(${__name}):TxJob:errorAll] going to run ${this.current.name} mount point, this.trace.length = ${this.trace.length}`);
  
    data.setReply(this.current.reply());
    this.current.tasks().error(data);
  }

  private async publish(task: TxTask<any>, next: TxMountPoint) {
    if (TxJobExecutionOptionsChecker.isDisribute(this.options)) {
      logger.info('going to publish jobId:', this.getUuid())
      await TxJobRegistry.instance.getDistribute().send(this.toJSON(), 'job', task, this.options)

      this.release();
      return;
    }

    next.tasks().next(task);
  }

  private async publishError(task: TxTask<any>, next: TxMountPoint) {
    if (TxJobExecutionOptionsChecker.isDisribute(this.options)) {
      logger.info('going to publishError jobId:', this.getUuid())
      await TxJobRegistry.instance.getDistribute().send(this.toJSON(), 'job', task, this.options)

      this.release();
      return;
    }
    next.tasks().error(task);
  }

  /**
   * S2S: in case of S2S take all the mountpoint defined in this.services
   * and use them for the executions.
   */
  private setFromServices() {    
    let service = TxJobRegistry.instance.getServiceName();

    let names = this.services.getNames(service);
    names.forEach(name => this.add(TxSinglePointRegistry.instance.get(name)));
  }

  private isMultiPoint(mp: TxMountPoint): mp is TxMultiPoint {
    return mp instanceof TxMultiPoint;
  }

  private shift(options: TxSubscribeOptions = defaultSubscribeOptions) {
    this.current = this.stack.shift();
    this.trace.push(this.current);

    /**
     * goto: 
     * if current isMultiPoint then get the actual doublepoint from it by options.goto
     */
    if (this.isMultiPoint(<TxDoublePoint>this.current.sender)) {
      const multipoint = <TxMultiPoint>this.current.sender;
      logger.info(`[TxJob::shift] [${this.name}/${this.uuid}] found multipoint: ${multipoint.name}`);

      if ( ! multipoint.has(options.goto) ) {
        throw new Error(`unable to find mountpoint '${options.goto}' in multipoint ${multipoint.name} to goto`);
      }

      this.current = multipoint.get(options.goto);
    }    

    this.executionId.sequence++;

    return this.current;
  }

  private shiftError(options: TxSubscribeOptions = defaultSubscribeOptions) {
    switch (TxJobExecutionOptionsChecker.getErrorDirection(this.options)) {
      case TxDirection.forward:  {
        this.current = this.stack.shift();        
        this.current = this.shiftErrorGetCurrent(this.current, options);

        this.executionId.sequence++;
      }
      break;
      case TxDirection.backward: {
        this.current = this.trace.pop();
        this.current = this.shiftErrorGetCurrent(this.current, options);
  
        this.executionId.sequence++;
      }
      break;
      default: 
        throw Error('direction must be TxDirection.forward | TxDirection.backward')
    }

    return this.current;
  }

  private shiftErrorGetCurrent(current: TxDoublePoint, options: TxSubscribeOptions = defaultSubscribeOptions) {      
    if (this.isMultiPoint(current.sender)) {      
      const multipoint: TxMultiPoint = current.sender;

      if ( ! multipoint.has(options.goto) ) {
        throw new Error(`unable to find mountpoint '${options.goto}' in multipoint ${multipoint.name} to goto`);
      }
      this.current = multipoint.get(options.goto);          

      return this.current;
    }

    return this.current;
  }

  reset() {
    this.stack = [];      
    this.trace = [];      

    this.block.forEach(mp => {      
      this.stack.push(mp);                          
    });

    this.current = null;
    this.single = false;
    this.error = false;
    this.revert = false;
    
    this.isCompleted.unsubscribe();
    this.executionId = {uuid: '', sequence: 0};
  }

  unsubscribes() {
    this.subscribers.forEach(cb => {
      cb.unsubscribe();
    });
  }

  release() {
    TxJobRegistry.instance.del(this.getUuid());
    this.unsubscribes()
    this.services.release();
    this.executionId = {uuid: '', sequence: 0};
  }

  notify(data: TxTask<any>) {
    if ( ! TxJobExecutionOptionsChecker.isNotify(this.options) ) {
      return;
    }

    if (this.options.execute.notify.from !== TxJobRegistry.instance.getServiceName()) {
      return;
    }  
    let mp = TxMountPointRegistry.instance.get(this.options.execute.notify.name);

    if (this.error) {        
      mp.reply().error(data);

      return
    }
    
    mp.reply().next(data);
  }

  private finish(task: TxTask<any>, notification = true) {    
    this.revert = false;
    this.single = false;
    this.services.shift(task);        

    if (notification) {
      this.notify(task);
    }
    this.isCompleted.next(task);
    TxJobRegistry.instance.emit('job: ' + this.getUuid(), {job: this, task})
  }
  
  private isFinish() {
    if (this.stack.length > 0) {
      return false;
    }
    if (this.waiting.size > 0) {
      return false;
    }

    return true;
  }
  
  private isErrorFinish() {
    let isend = false;

    switch (TxJobExecutionOptionsChecker.getErrorDirection(this.options)) {
      case TxDirection.forward:  isend = this.stack.length === 0; break;
      case TxDirection.backward: isend = this.trace.length === 0; break;
    }

    return isend;
  }

  private doErrorFinish(task: TxTask<any>) {
    const __name = TxJobRegistry.instance.getServiceName();
          
    logger.info(`[(${__name}):TxJob:errorCB] [${this.name}/${this.getUuid()}] complete running errors all mount points, trace.length = ${this.trace.length}, stack.length = ${this.stack.length}`);
          
    this.services.error(task);
    this.isCompleted.error(task);
    this.notify(task);
    TxJobRegistry.instance.emit('job:error: ' + this.getUuid(), {job: this, task})    
  }

  toJSON(): TxJobJSON {
    return {
      name: this.name,
      uuid: this.uuid,
      stack: this.stack.map((e) => {return e.name}).toString(),
      trace: this.trace.map((e) => {return e.name}).toString(),
      block: this.block.map((e) => {return e.name}).toString(),
      error: this.error,
      single: this.single,
      revert: this.revert,
      current: this.getCurrentName(),
      executeUuid: this.executionId.uuid,
      sequence: this.executionId.sequence,
      services: this.services.toJSON()
    }
  }

  upJSON(json: TxJobJSON) {
    TxJobRegistry.instance.replace(this.uuid, json.uuid, this);

    this.block = [];
    json.block.split(',').forEach(name => {
      if (name !== '') {
        let doublepoint = this.newDoublePoint(TxSinglePointRegistry.instance.get(name));

        this.subscribe(doublepoint);
        this.block.push(doublepoint);
      }
    });

    this.name = json.name;
    this.uuid = json.uuid;
    this.error = json.error;
    this.single = json.single;
    this.revert = json.revert;
    this.current = json.current !== '' ? this.getDoublePoint(json.current) : null;
    this.executionId.uuid = json.executeUuid;
    this.executionId.sequence = json.sequence;

    this.stack = [];
    json.stack.split(',').forEach(name => {
      if (name !== '') {
        this.stack.push(this.getDoublePoint(name));
      }
    });

    this.trace = [];
    json.trace.split(',').forEach(name => {      
      if (name !== '') {
        this.trace.push(this.getDoublePoint(name));
      }
    }); 

    this.services = new TxJobServices(this).upJSON(json.services);
    TxJobRegistry.instance.add(this.uuid, this);

    return this;    
  }

  
  static create(json: TxJobJSON) {
    return (new TxJob('internal')).upJSON(json);
  }

  /**
   * Add record to options is optional, if options.execute.record === true then
   * set TxJobRepository.setRecordFlag(this.job, true) to on.
   * This flag is override TxJobRepository.recordFlag and return true.
   *
   * If options.execute.record === false then turn record off on the TxJobRegistry and return false;
   *
   * If options.execute.record is not exit (not define) then use the TxJobRegistry flag
   *
   * @param {TxJobExecutionOptions} options
   * @returns {boolean}
   */
  private isRecord(options?: TxJobExecutionOptions) {
    if (TxJobExecutionOptionsChecker.isRecordDefine(options)) {
      TxJobRegistry.instance.setRecordFlag(this.name, options.execute.record);

      return options.execute.record;
    }
    return TxJobRegistry.instance.getRecordFlag(this.name);
  }

  private async record(info: any, method: string) {
    let index: TxRecordIndexSave;
    index = {
      executeUuid: this.executionId.uuid,
      sequence: this.executionId.sequence,
      job: {
        name: this.name,
        uuid: this.uuid
      },
      component: this.current.name.toString(),
      method: method,
      date: {
        tasks: (new Date()).toString(),
        reply: (new Date()).toString(),
      }
    };

    if (method === 'insert') {
      await this.recorder.insert(index, info);
    }

    if (method === 'update') {
      await this.recorder.update(index, info);
    }
  }

  genExecutionId() {
    this.executionId = {uuid: longUuid(), sequence: 1};
  }

  getExecutionId() {
    return this.executionId;
  }

  getCurrentName() {
    if (this.current === null) {
      return '';
    }
    return this.current.name;
  }

  getIsCompleted() {
    return this.isCompleted;
  }

  get isCompleted() {
    return this._isCompleted;
  }

  set isCompleted(_isCompleted) {
    this._isCompleted = _isCompleted;
  }

  getIsStopped() {
    return this.isStopped;
  }

  getOnComponent() {
    return this.onComponent;
  }

  getOnError() {
    return this.onError;
  }

  getName() {
    return this.name;
  }
  
  getUuid(): string {
    return this.uuid;
  }

  getOptions() {
    return this.options;
  }
}