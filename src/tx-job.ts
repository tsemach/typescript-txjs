import createLogger from 'logging'; 
const logger = createLogger('Job');

import { Subject } from 'rxjs';
import { TxMountPoint } from './tx-mountpoint';
import { TxMountPointRegistry } from '../src/tx-mountpoint-registry';

export const enum TxDirection {
  forrward = 1,
  backward,
}    

export class TxJob {
  isCompleted = new Subject<number>();

  stack = [];  // mountpoints needs to be run
  trace = [];  // mountpoints already run
  block = [];  // all the mountpoints added to this job, need to reexecute the job

  single = false;
  current = null;
  
  constructor(private name: string = '') {
  }

  subscribe(txMountPoint: TxMountPoint) {
    logger.info(`[TxJob:subscribe] going to add '${txMountPoint.name}' mount point`);    
    txMountPoint.reply().subscribe(
      (data) => {
        logger.info(`[TxJob:subscribe] got reply from '${data['method']}' method, data = ${JSON.stringify(data, undefined, 2)}`);
        logger.info(`[TxJob:subscribe] before shift to next task, stack.len = ${this.stack.length}`);
      
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
        this.finish();
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
    // logger.info(`[TxJob:add] going to add '${txMountPoint.name}' mount point`);    
    // txMountPoint.reply().subscribe(
    //   (data) => {
    //     logger.info(`[TxJob:add] got reply from '${data['method']}' method, data = ${JSON.stringify(data, undefined, 2)}`);
    //     logger.info(`[TxJob:add] before shift to next task, stack.len = ${this.stack.length}`);
      
    //     if (this.stack.length > 0) {
    //       /**
    //        * make the next move, get the next mountpoint from the stack,
    //        * and send the data to it's tasks subject.
    //        */
    //       let next = this.shift();
    //       logger.info(`[TxJob:add] going to run next task: ${next.name}`);
                    
    //       next.tasks().next(data);
          
    //       return;
    //     }
    //     logger.info(`[TxJob:add] complete running all jobs mount points, stack.length = ${this.stack.length}, trace.length = ${this.trace.length}`);
    //     this.finish();
    //   },
    //   (err) => {
    //     logger.info('[TxJob:add] error is called');
    //   },
    //   () => {
    //     logger.info('[TxJob:add] complete is called')
    //   }
    // );
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
    this.current.tasks().next(data);
  }

  undo(direction: TxDirection) {
    console.log("undo: direction = " + direction);
  }

  shift() {
    this.current = this.stack.shift();
    this.trace.push(this.current);

    return this.current;
  }

  reset() {    
    this.trace = [];  
    this.stack = this.block;
    this.current = null;
    this.single = false;
  }

  finish() {    
    this.isCompleted.next(this.trace.length);

    this.trace.forEach((e) => {
      e.reply().unsubscribe();
    });
    this.trace = [];
  }

  toJSON() {
    return {
      name: this.name,
      stack: this.stack.map((e) => {return e.name}).toString(),
      trace: this.trace.map((e) => {return e.name}).toString(),
      block: this.block.map((e) => {return e.name}).toString(),
      single: this.single,
      current: this.getCurrentName()
    }    
  }

  upJSON(json) {    
    this.name = json.name;    
    this.single = json.single;
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
        console.log("BLOCK : name = " + name) ;
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
  
}