import createLogger from 'logging'; 
const logger = createLogger('Job');

import * as longUuid from 'uuid/v4';
import * as short from 'short-uuid';
const uuid = short();

import { Subject } from 'rxjs';
import { TxMountPoint } from './tx-mountpoint';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxJobRegistry } from './tx-job-resgitry';
import { TxJobJSON } from "./tx-job-json";
import { TxTask } from "./tx-task";
import { TxJobExecutionOptions, TxJobExecutionOptionsChecker } from "./tx-job-execution-options";
import { TxRecordPersistAdapter, TxRecordIndexSave } from "./tx-record-persist-adapter";
import { TxJobExecutionId } from "./tx-job-execution-id";
import { TxJobServices } from './tx-job-services';

export const enum TxDirection {
  forward = 1,
  backward,
}

let defaultOptions: TxJobExecutionOptions = {
  "persist": {
    "ison": false,
    "destroy": false
  },
  execute: {
    record: false
  }
} as TxJobExecutionOptions;

export class TxJob {
  isCompleted = new Subject();  // notify when the whole execution is completed.
  isStopped = new Subject();    // notify when execution reach to it's run-until component.
  onComponent = new Subject();  // notify the world on any coming in subscribe callback (reply from component).
  onError = new Subject();  // notify the world on any coming in subscribe callback (reply from component).

  uuid = uuid.new();

  stack = [];       // mountpoints needs to be run
  trace = [];       // mountpoints already run
  block = [];       // all the mountpoints added to this job, useful when need to reexecute the job
  subscribers = []; // a list of all the subscribes job is registered.

  error = false;
  single = false;
  revert = false;
  current = null;
  options = defaultOptions;

  executionId: TxJobExecutionId = {uuid: '', sequence: 0};
  recorder: TxRecordPersistAdapter;

  services = new TxJobServices(this);

  constructor(private name: string = '') {
    if (name !== '') {
      TxJobRegistry.instance.add(this.uuid, this);
    }
    this.recorder = TxJobRegistry.instance.getRecorderDriver();
  }

  async subscribeCB(data, txMountPoint: TxMountPoint) {
    logger.info(`[TxJob:subscribe] [${this.name}] got reply, data = ${JSON.stringify(data, undefined, 2)}`);
    logger.info(`[TxJob:subscribe] [${this.name}] before shift to next task, stack.len = ${this.stack.length}`);

    if (this.error) {
      throw new Error(`[TxJob:subscribe] ERROR: job: ${this.name} is on error but got subscribe callback from a mountpoint`);
    }

    if (this.isRecord(this.options)) {
      await this.record({reply: data}, 'update');
    }
    this.onComponent.next(new TxTask<{name: string}>({name: <string>txMountPoint.name}, {data: data}));

    if (this.revert) {
      this.undoCB(data);

      return;
    }

    if (this.single) {
      this.getIsStopped().next(data);
    }

    if (this.stack.length === 0) {
      logger.info(`[TxJob:subscribe] [${this.name}] complete running all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}`);
      this.finish(data);

      return;
    }

    if (this.single) {
      if (TxJobExecutionOptionsChecker.isDestroy(this.options)) {
        logger.info(`[TxJob:subscribe] [${this.name}] single step - going to destroy job \'${this.getUuid()}\', on ${this.current.name} mount point`);

        this.release();
      }
      return
    }

    /**
     * make the next move, get the next mountpoint from the stack,
     * and send the data to it's tasks subject.
     */
    let next = this.shift();
    logger.info(`[TxJob:subscribe] [${this.name}] going to run next task: ${next.name}`);

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    if (TxJobExecutionOptionsChecker.isUntil(this.options, next.name)) {
      logger.info(`[TxJob:subscribe] [${this.name}] found execute.until, on ${next.name} mount point`);

      if (TxJobExecutionOptionsChecker.isDestroy(this.options)) {
        logger.info(`[TxJob:subscribe] [${this.name}] going to destroy job \'${this.getUuid()}\', on ${next.name} mount point`);

        this.release();
      }

      this.getIsStopped().next(data);

      return;
    }

    if (this.isRecord(this.options)) {
      await this.record({tasks: data}, 'insert');
    }

    next.tasks().next(data);
  }

  async errorCB(data,  txMountPoint: TxMountPoint) {
    logger.info(`[TxJob:errorCB] [${this.name}] got error, data = ${JSON.stringify(data, undefined, 2)}`);
    logger.info(`[TxJob:errorCB] [${this.name}] before shift to next error, trace.len = ${this.trace.length}`);

    // set error mode to true and rise onError event.
    if (this.error == false) {
      logger.info(`[TxJob:errorCB] [${this.name}] first time enter to error handler, remove current occluding the error`);

      this.trace.pop();
      this.error = true;
    }
    this.onError.next(new TxTask<{ name: string }>({name: <string>txMountPoint.name}, {data: data}));

    if (this.trace.length === 0) {
      logger.info(`[TxJob:errorCB] [${this.name}] complete running errors all mount points, trace.length = ${this.trace.length}, stack.length = ${this.stack.length}`);
      this.isCompleted.error(data);

      return;
    }

    this.current = this.trace.pop();
    logger.info(`[TxJob:errorCB] [${this.name}] after pop this.currnet = ${this.current.name}`);

    this.stack.push(this.current);

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    this.current.tasks().error(data);
  }

  subscribe(txMountPoint: TxMountPoint) {
    logger.info(`[TxJob:subscribe] [${this.name}] going to add '${txMountPoint.name}' mount point`);
    const subscribed = txMountPoint.reply().subscribe(
      async (data) => {
        await this.subscribeCB(data, txMountPoint);
        // logger.info(`[TxJob:subscribe] [${this.name}] got reply, data = ${JSON.stringify(data, undefined, 2)}`);
        // logger.info(`[TxJob:subscribe] [${this.name}] before shift to next task, stack.len = ${this.stack.length}`);
        //
        // if (this.isRecord(this.options)) {
        //   await this.record({reply: data}, 'update');
        // }
        // this.onComponent.next(new TxTask<{name: string}>({name: <string>txMountPoint.name}, {data: data}));
        //
        // if (this.revert) {
        //   this.undoCB(data);
        //
        //   return;
        // }
        //
        // if (this.single) {
        //   this.getIsStopped().next(data);
        // }
        //
        // if (this.stack.length === 0) {
        //   logger.info(`[TxJob:subscribe] [${this.name}] complete running all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}`);
        //   this.finish(data);
        //
        //   return;
        // }
        //
        // if (this.single) {
        //   if (TxJobExecutionOptionsChecker.isDestroy(this.options)) {
        //     logger.info(`[TxJob:subscribe] [${this.name}] single step - going to destroy job \'${this.getUuid()}\', on ${this.current.name} mount point`);
        //
        //     this.release();
        //   }
        //   return
        // }
        //
        // /**
        //  * make the next move, get the next mountpoint from the stack,
        //  * and send the data to it's tasks subject.
        //  */
        // let next = this.shift();
        // logger.info(`[TxJob:subscribe] [${this.name}] going to run next task: ${next.name}`);
        //
        // if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
        //   await TxJobRegistry.instance.persist(this);
        // }
        //
        // if (TxJobExecutionOptionsChecker.isUntil(this.options, next.name)) {
        //   logger.info(`[TxJob:subscribe] [${this.name}] found execute.until, on ${next.name} mount point`);
        //
        //   if (TxJobExecutionOptionsChecker.isDestroy(this.options)) {
        //     logger.info(`[TxJob:subscribe] [${this.name}] going to destroy job \'${this.getUuid()}\', on ${next.name} mount point`);
        //
        //     this.release();
        //   }
        //
        //   this.getIsStopped().next(data);
        //
        //   return;
        // }
        //
        // if (this.isRecord(this.options)) {
        //   await this.record({tasks: data}, 'insert');
        // }
        //
        // next.tasks().next(data);
      },
      async (error) => {
        await this.errorCB(error, txMountPoint);
        //logger.info(`[TxJob:subscribe] [${this.name}] error is called`);
      },
      () => {
        logger.info(`[TxJob:subscribe] [${this.name}] complete is called`)
      }
    );
    this.subscribers .push(subscribed);
  }

  /**
   * use when defining S2S. like: job.on('service').add('mountpoint')
   * @param serivce in case of S2S set the service of the following mountpoint
   */
  on(serivce: string) {
    return this.services.on(serivce);
  }

  add(txMountPoint: TxMountPoint) {    
    this.subscribe(txMountPoint);
    this.stack.push(txMountPoint);
    this.block.push(txMountPoint);
    TxJobRegistry.instance.addComponent(this.name, txMountPoint.name);
  }

  async execute(data, options: TxJobExecutionOptions = defaultOptions) {
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
      this.current.tasks().error(data);

      return;
    }

    this.trace = [];
    let runit = this.shift();
    logger.info(`[TxJob:execute] going to run ${runit.name} mount point`);

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    if (this.isRecord(options)) {
      this.genExecutionId();
      await this.record({tasks: data}, 'insert');
    }

    runit.tasks().next(data);
  }

  async continue(data, options: TxJobExecutionOptions = defaultOptions) {
    this.single = false;
    this.options = options;
    if (this.stack.length === 0) {
      logger.info(`[TxJob:continue] stack.length = 0`);

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
  async step(data, options: TxJobExecutionOptions = defaultOptions) {
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

    this.current.tasks().next(data);
  }

  async undoCB(data) {
    logger.info(`[TxJob:undoCB] got reply from '${data['method']}' method, data = ${JSON.stringify(data, undefined, 2)}`);
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

      next.undos().next(data);
      
      return;
    }
    logger.info(`[TxJob:undoCB] complete undo all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}`);
    this.finish(data);
  }

  async undo(data, direction: TxDirection = TxDirection.backward) {
    logger.info('[TxJob:undo]: direction = ' + direction);

    this.revert = true;
    this.stack = [];
    
    switch (direction) {
      case TxDirection.forward: this.stack = this.trace; break;
      case TxDirection.backward: this.stack = this.trace.reverse(); break;
    }

    this.trace = [];
    this.current = this.stack.shift();

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    this.current.undos().next(data);
  }

  /**
   * S2S: in case of S2S take all the mountpoint defined in this.services
   * and use them for the executions.
   */
  private setFromServices() {
    console.log("IN setFromServices")
    let service = TxJobRegistry.instance.getServiceName();

    let names = this.services.getNames(service);
    names.forEach(name => this.add(TxMountPointRegistry.instance.get(name)));
  }

  shift() {
    this.current = this.stack.shift();
    this.trace.push(this.current);
    this.executionId.sequence++;

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

    this.executionId = {uuid: '', sequence: 0};
  }

  release() {
    TxJobRegistry.instance.del(this.getUuid());
    this.subscribers.forEach(cb => {
      cb.unsubscribe();
    });
    this.executionId = {uuid: '', sequence: 0};
  }

  finish(data) {    
    this.revert = false;
    this.single = false;
    this.services.shift(TxJobRegistry.instance.getServiceName(), data);
    this.isCompleted.next(data);
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

    this.name = json.name;
    this.uuid = json.uuid;
    this.error = json.error;
    this.single = json.single;
    this.revert = json.revert;
    this.current = json.current !== '' ? TxMountPointRegistry.instance.get(json.current) : null;
    this.executionId.uuid = json.executeUuid;
    this.executionId.sequence = json.sequence;

    this.stack = [];
    json.stack.split(',').forEach(name => {
      if (name !== '') {
        this.stack.push(TxMountPointRegistry.instance.get(name));

      }
    });

    this.trace = [];
    json.trace.split(',').forEach(name => {      
      if (name !== '') {
        this.trace.push(TxMountPointRegistry.instance.get(name));
      }
    }); 

    this.block = [];
    json.block.split(',').forEach(name => {
      if (name !== '') {
        let mp = TxMountPointRegistry.instance.get(name);

        this.subscribe(mp);
        this.block.push(mp);
      }
    });

    this.services = new TxJobServices(this).upJSON(json.services);
    TxJobRegistry.instance.add(this.uuid, this);

    return this;    
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

}