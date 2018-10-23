
import { TxJobRegistry } from './tx-job-resgitry';

interface TxMonitorOverviewJods {
  name: string,
  components: {name: string}[];
}

interface TxMonitorOverview {
  name: string,
  jobs: TxMonitorOverviewJods[];
}

class TxMonitor {
  name = '';

  constructor() {

  }

  setServiceName(name: string) { 
    this.name = name;
  }

  /** 
   * getOverview return array of:
   * {
   *   name: 'job-11',
   *   uuid: '1234',
   *   components: [
   *     { name: 'AWS::CREATE' },
   *     { name: 'AWS::DELETE' }
   *   ]
   * }
  */
  getOverview() {
    let jobs = <Map<string, Set<string>>>TxJobRegistry.instance.getComponents();
        
    let overview: TxMonitorOverview = {name: this.name, jobs: []};   
    
    jobs.forEach((components, job)  => {
      overview.jobs.push({name: job, components: Array.from(components, item => { return {name :item} })});      
    });
    //console.log("jobsArray.components = ", JSON.stringify(overview, undefined, 2));
    
    return overview;
  }

}

export default new TxMonitor();