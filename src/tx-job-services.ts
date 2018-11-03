import { TxJobRegistry } from './tx-job-resgitry';

import createLogger from 'logging';
const logger = createLogger('TxJobServices');

import { TxJob } from "./tx-job";
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxJobServicesJSON } from "./tx-job-services-json";
import { TxTask } from "./tx-task";
import { TxJobServicesHeadTask } from "./tx-job-services-task";

/**
 * TxJobServices is helper class use to hanlde S2S feature (cross services job).
 *  it hold information about service => and all its mountpoints.
 *  usage: job.on('service').add('mountpoint')
 *  
 *  on shift it send the job serialization to next server using C2C queuepint TxJobServicesComponent component.
 */

export class TxJobServices {
  private jobs = new Map<string, Array<string | Symbol>>(); // mapping between service name and all its job's mountpoints (components)
  private stack = [];   // list of all services needed to be run, this change during execution
  private trace = [];   // list of already run servies, fill during execution
  private block = [];   // list of all services needed to run in order, not change during execution  
  private current = ''; // the current service pass with 'on' method, this use jsut for add mountpoint

  constructor(private job: TxJob) {    
  } 

  on(service: string) {
  
    /**
     * add a service only one time, the on method can be called many time.
     * like job.on('service').add(Symbol('mountpoint'));
     */ 
    if ( ! this.jobs.has(service) ) {
      this.jobs.set(service, new Array<string | Symbol>());

      this.stack.push(service);
      this.block.push(service);
    }
    this.current = service;

    return this;
  }

  add(name: string | Symbol) {
    if ( ! this.jobs.has(this.current) ) {
      throw Error('ERROR on add without on, service ' + this.current + ' is not define, use on method');
    }

    if ( ! this.jobs.has(this.current) ) {
      throw Error(`service - ${this.current} - is not define, make sure you start with 'job.on('service').add('mountpoint)`);
    }
    this.jobs.get(this.current).push(name);    
  }  

  shift(task) {    
    this.trace.push(this.stack.shift());
    logger.info(`[TxServices:shift] begin, stack.length = ${this.stack.length}, track.length = ${this.trace.length}`);

    if (this.stack.length == 0) {
      logger.info('shift: no more jobs to run, stack.length = 0, track.length = ',  this.trace.length);

      return;
    }
    let current = this.stack[0];
    logger.info('shift: current job is - ', current)
        
    let data = {
      job: this.getJsonForSending(),
      task,
      options: this.job.getOptions()
    }

    // diconnect pervious callback so will not collustion with next run.
    this.job.unsubscribes();    

    // S2S: use this mountpoint to continue the jop on the next service
    let mountpoint = TxMountPointRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');
    mountpoint.tasks().next(new TxTask<TxJobServicesHeadTask>({next: current}, data));``
  }

  error(task) {   
    let __name = TxJobRegistry.instance.getServiceName();
    logger.info(`[(${__name}):TxServices:error] enter to error, trace.length = ${this.trace.length}, stack.length = ${this.stack.length}`); 

    if (this.trace.length == 0) {
      logger.info(`[(${__name}):TxServices:error] no more service to run, stack.length = ${this.stack.length}, track.length = ${this.trace.length}`);

      return;
    }

    this.current = this.trace.pop();    
    logger.info(`[(${__name}):TxServices:error] going to send error to service - ${this.current}`);
        
    let data = {
      job: this.getJsonForSending(),
      task,
      options: this.job.getOptions()
    }  

    // diconnect pervious callback so will not collustion with next run.
    this.job.unsubscribes();    

    // S2S: use this mountpoint to continue the jop on the next service
    let mountpoint = TxMountPointRegistry.instance.get('JOB::SERVICES::MOUNTPOINT::COMPONENT');
    mountpoint.tasks().error(new TxTask<TxJobServicesHeadTask>({next: this.current}, data));
  }

  getNames(service: string) {
    if ( ! this.jobs.has(service) ) {
      throw Error(`mountpoints names for service ${service} is not found`);
    }

    return this.jobs.get(service);
  }

  toJSON(): TxJobServicesJSON {
    let jobs = []

    for (let entry of this.jobs.entries()) {      
      jobs.push({service: entry[0], components: entry[1]})
      
    }
    
    return {            
      stack: this.stack,
      trace: this.trace,
      block: this.block,
      current: '',          
      jobs: jobs
    }
  }
  
  upJSON(from: TxJobServicesJSON) {
    this.stack = from.stack;
    this.trace = from.trace;
    this.block = from.block;
      
    from.jobs.forEach(job => {      
      this.jobs.set(job.service, job.components)
    })

    return this;
  }

  getJsonForSending() {
    let json = this.job.toJSON();

    json.current = '';
    json.stack = '';
    json.trace = '';
    json.block = '';

    return json;
  }

  setError(): any {
  }

  release() {    
  }

}