
import { TxJobRegistry } from './tx-job-resgitry';
import { TxMountPointRxJSRegistry } from './tx-mountpointrxjs-registry';
import { TxTask } from './tx-task';
import { TxMonitorServerTaskHeader } from './tx-monitor-server-task-header';

interface TxMonitorOverviewJods {
  name: string,
  components: {name: string}[];
}

interface TxMonitorOverview {
  name: string,
  jobs: TxMonitorOverviewJods[];
}

class TxMonitor {

  constructor() {

  }

  runBuiltInServer(host: string, port: number) {
    let mp = TxMountPointRxJSRegistry.instance.get('RX-TXJS::MONITOR::SERVER');
    
    mp.tasks().next(new TxTask<TxMonitorServerTaskHeader>({method: 'start'}, {host, port}));    
  }

  /** 
   * getOverview return json similar to:
   * {
   *   name: <service-name>
   *   {
   *     name: 'job-11',
   *     uuid: '1234',
   *     components: [
   *       { name: 'AWS::CREATE' },
   *       { name: 'AWS::DELETE' }
   *     ]
   *   }
   * }
  */
  getOverview(serviceName) {
    let jobs = <Map<string, Set<string>>>TxJobRegistry.instance.getJobs();
        
    let overview: TxMonitorOverview = {name: serviceName, jobs: []};   
    
    jobs.forEach((components, job)  => {
      overview.jobs.push({name: job, components: Array.from(components, item => { return {name :item} })});      
    });
    //console.log("jobsArray.components = ", JSON.stringify(overview, undefined, 2));
    
    return overview;
  }

}

export default new TxMonitor();