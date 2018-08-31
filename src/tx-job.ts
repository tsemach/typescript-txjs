import createLogger from 'logging'; 
const logger = createLogger('Job');
import * as short from 'short-uuid';
const uuid = short();

import { Subject } from 'rxjs';
import { TxMountPoint } from './tx-mountpoint';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxJobRegistry } from './tx-job-resgitry';
import { TxJobJSON } from "./tx-job-json";

export const enum TxDirection {
  forward = 1,
  backward,
}    

export class TxJob {
  isCompleted = new Subject<number>();

  uuid = uuid.new();

  stack = [];  // mountpoints needs to be run
  trace = [];  // mountpoints already run
  block = [];  // all the mountpoints added to this job, need to reexecute the job

  single = false;
  revert = false;
  current = null;
  
  constructor(private name: string = '') {
    console.log("UUID: " + this.uuid);
    TxJobRegistry.instance.add(this.uuid, this);
  }
  
  subscribe(txMountPoint: TxMountPoint) {
    logger.info(`[TxJob:subscribe] going to add '${txMountPoint.name}' mount point`);    
    txMountPoint.reply().subscribe(
      (data) => {
        logger.info(`[TxJob:subscribe] got reply from '${data['method']}' method, data = ${JSON.stringify(data, undefined, 2)}`);
        logger.info(`[TxJob:subscribe] before shift to next task, stack.len = ${this.stack.length}`);

        if (this.revert) {
          this.undoCB(data);

          return;
        }
      
        if (this.stack.length > 0) {
          /**
           * make the next move, get the next mountpoint from the stack,
           * and send the data to it's tasks subject.
           */
          if ( ! this.single ) {
            let next = this.shift();
            logger.info(`[TxJob:subscribe] going to run next task: ${next.name}`);
          
            next.tasks().next(data);
          }
          
          return;
        }
        logger.info(`[TxJob:subscribe] complete running all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}`);
        this.finish(data);
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

  execute(data) {
    this.single = false;
    if (this.stack.length === 0) {
      logger.info(`[TxJob:execute] stack.length = 0`);  

      return;
    }
    this.trace = [];
    let runme = this.shift();
    logger.info(`[TxJob:execute] going to run ${runme.name} mount point`);
    
    runme.tasks().next(data);
  }

  /**
   * run the components step by step, after each step the control return to user
   * the call to step again to run next component. 
   * @param data the data to pass to components
   */
  step(data) {
    this.single = true;
    if (this.stack.length === 0) {
      logger.info(`[TxJob:step] stack.length = 0`);  
      
      return;
    }
    this.current = this.stack.shift();
    logger.info(`[TxJob:step] going to run next task: ${this.current.name}`);
    this.current.tasks().next(data);
  }

  continue(data) {
    this.single = false;
    this.current = this.stack.shift();
    
    if ( ! this.revert) {
      this.current.tasks().next(data);
    }
    else {
      this.current.undos().next(data);
    }
  }

  undoCB(data) {
    logger.info(`[TxJob:undoCB] got reply from '${data['method']}' method, data = ${JSON.stringify(data, undefined, 2)}`);
    logger.info(`[TxJob:undoCB] before shift to next task, stack.len = ${this.stack.length}`);
      
    if (this.stack.length > 0) {
      /**
       * make the next move, get the next mountpoint from the stack,
       * and send the data to it's tasks subject.
       */      
        let next = this.shift();
        logger.info(`[TxJob:undoCB] going to undo next task: ${next.name}`);
      
        next.undos().next(data);
      
      return;
    }
    logger.info(`[TxJob:undoCB] complete undo all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}`);
    this.finish(data);
  }

  undo(data, direction: TxDirection = TxDirection.backward) {
    logger.info('[TxJob:undo]: direction = ' + direction);

    this.revert = true;
    this.stack = [];
    
    switch (direction) {
      case TxDirection.forward: this.stack = this.trace; break;
      case TxDirection.backward: this.stack = this.trace.reverse(); break;
    };

    this.trace = [];

    this.current = this.stack.shift();
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
    this.name = json.name;
    this.uuid = json.uuid;
    this.single = json.single;
    this.revert = json.revert;
    this.current = json.current !== '' ? TxMountPointRegistry.instance.get(json.current) : null;

    this.stack = [];
    json.stack.split(',').forEach(name => {
      if (name !== '') {
        this.add(TxMountPointRegistry.instance.get(name));
      }
    });    

    this.trace = [];
    json.trace.split(',').forEach(name => {      
      if (name !== '') {
        let mp = TxMountPointRegistry.instance.get(name)
  
        this.subscribe(mp);
        this.trace.push(mp);
      }
    }); 

    this.block = [];
    json.block.split(',').forEach(name => {
      if (name !== '') {
        this.block.push(TxMountPointRegistry.instance.get(name));
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

  getName() {
    return this.name;
  }
  
  getUuid(): string {
    return this.uuid;
  }
}