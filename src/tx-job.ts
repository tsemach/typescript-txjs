import createLogger from 'logging'; 
const logger = createLogger('Job');
import * as short from 'short-uuid';
const uuid = short();

import { Subject } from 'rxjs';
import { TxMountPoint } from './tx-mountpoint';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxJobRegistry } from './tx-job-resgitry';
import { TxJobJSON } from "./tx-job-json";
import { TxJobExecutionOptions, TxJobExecutionOptionsChecker } from "./tx-job-execution-options";

export const enum TxDirection {
  forward = 1,
  backward,
}

let defaultOptions: TxJobExecutionOptions = {
  "persist": {
    "ison": false,
    "destroy": false
  }
} as TxJobExecutionOptions;

export class TxJob {
  isCompleted = new Subject();
  isStopped = new Subject();

  uuid = uuid.new();

  stack = [];  // mountpoints needs to be run
  trace = [];  // mountpoints already run
  block = [];  // all the mountpoints added to this job, useful when need to reexecute the job

  single = false;
  revert = false;
  current = null;
  options = defaultOptions;
  
  constructor(private name: string = '') {
    TxJobRegistry.instance.add(this.uuid, this);
  }
  
  subscribe(txMountPoint: TxMountPoint) {
    logger.info(`[TxJob:subscribe] going to add '${txMountPoint.name}' mount point`);    
    txMountPoint.reply().subscribe(
      async (data) => {
        logger.info(`[TxJob:subscribe] got reply, data = ${JSON.stringify(data, undefined, 2)}`);
        logger.info(`[TxJob:subscribe] before shift to next task, stack.len = ${this.stack.length}`);

        if (this.revert) {
          this.undoCB(data);

          return;
        }
      
        if (this.stack.length === 0) {
          logger.info(`[TxJob:subscribe] complete running all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}`);
          this.finish(data);

          return;
        }

        if (this.single) {
          return
        }

        /**
         * make the next move, get the next mountpoint from the stack,
         * and send the data to it's tasks subject.
         */
        let next = this.shift();
        logger.info(`[TxJob:subscribe] going to run next task: ${next.name}`);

        if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
          await TxJobRegistry.instance.persist(this);
        }

        if (TxJobExecutionOptionsChecker.isUntil(this.options, next.name)) {
          logger.info(`[TxJob:subscribe] found execute.until, on ${next.name} mount point`);

          if (TxJobExecutionOptionsChecker.isDestroy(this.options)) {
            logger.info(`[TxJob:subscribe] going to destroy job \'${this.getUuid()}\', on ${next.name} mount point`);

            this.release();
          }

          this.getIsStopped().next(data);

          return;
        }

        next.tasks().next(data);
      },
      (err) => {
        logger.info('[TxJob:subscribe] error is called');
      },
      () => {
        logger.info('[TxJob:subscribe] complete is called')
      }
    );
  }

  add(txMountPoint: TxMountPoint) {    
    this.subscribe(txMountPoint);
    this.stack.push(txMountPoint);
    this.block.push(txMountPoint);
  }

  async execute(data, options: TxJobExecutionOptions = defaultOptions) {
    this.single = false;
    this.options = options;
    if (this.stack.length === 0) {
      logger.info(`[TxJob:execute] stack.length = 0`);  

      return;
    }
    this.trace = [];
    let runme = this.shift();
    logger.info(`[TxJob:execute] going to run ${runme.name} mount point`);

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    runme.tasks().next(data);
  }

  async continue(data, options: TxJobExecutionOptions = defaultOptions) {
    this.single = false;
    this.options = options;
    if (this.stack.length === 0) {
      logger.info(`[TxJob:continue] stack.length = 0`);

      return;
    }

    //this.current = this.stack.shift();
    //this.current = this.shift();

    if (TxJobExecutionOptionsChecker.isPersist(this.options)) {
      await TxJobRegistry.instance.persist(this);
    }

    if (this.revert) {
      this.current.undos().next(data);
    }
    else {
      this.current.tasks().next(data);
    }
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

  shift() {
    this.current = this.stack.shift();
    this.trace.push(this.current);

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
  }

  release() {
    TxJobRegistry.instance.del(this.getUuid());
    this.block.forEach(mp => {      
      mp.reply().unsubscribe();
    });
  }

  finish(data) {    
    this.revert = false;
    this.single = false;    
    this.isCompleted.next(data);
  }

  toJSON(): TxJobJSON {
    return {
      name: this.name,
      uuid: this.uuid,
      stack: this.stack.map((e) => {return e.name}).toString(),
      trace: this.trace.map((e) => {return e.name}).toString(),
      block: this.block.map((e) => {return e.name}).toString(),
      single: this.single,
      revert: this.revert,
      current: this.getCurrentName()
    }    
  }

  upJSON(json: TxJobJSON) {
    console.log("JOB::upJSON: " + this.uuid);
    TxJobRegistry.instance.replace(this.uuid, json.uuid, this);

    this.name = json.name;
    this.uuid = json.uuid;
    this.single = json.single;
    this.revert = json.revert;
    this.current = json.current !== '' ? TxMountPointRegistry.instance.get(json.current) : null;

    this.stack = [];
    json.stack.split(',').forEach(name => {
      if (name !== '') {
        console.log("JOB:upJSON: in stack " + name);
        this.stack.push(TxMountPointRegistry.instance.get(name));
      }
    });

    this.trace = [];
    json.trace.split(',').forEach(name => {      
      if (name !== '') {
        console.log("JOB:upJSON: in track " + name);
        this.trace.push(TxMountPointRegistry.instance.get(name));
      }
    }); 

    this.block = [];
    json.block.split(',').forEach(name => {
      console.log("JOB:upJSON: blokc = json.block = " + json.block);
      console.log("JOB:upJSON: name = " + name);
      if (name !== '') {

        console.log("JOB:upJSON: in loop of block json.block = " + json.block);
        let mp = TxMountPointRegistry.instance.get(name);

        this.subscribe(mp);
        this.block.push(mp);
      }
    });

    return this;    
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

  getName() {
    return this.name;
  }
  
  getUuid(): string {
    return this.uuid;
  }

}