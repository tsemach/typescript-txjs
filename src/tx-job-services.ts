
import { TxJob } from "./tx-job";
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxJobServicesJSON } from "./tx-job-services-json";

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

    if ( ! TxMountPointRegistry.instance.has(name) ) {
      throw Error(`mountpoint - ${name} - is not exist in TxMountPointRegistry, make sure the component is initialize first`);
    }
    this.jobs.get(this.current).push(name);    
  }

  shift(service: string, task) {
    this.trace.push(this.stack.shift());

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

}