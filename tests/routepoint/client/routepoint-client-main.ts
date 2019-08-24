
import { TxRouteServiceConfig }  from '../../../src/tx-route-service-config';
import { TxRoutePointRegistry } from '../../../src/tx-routepoint-registry';
import { TxRouteServiceTask } from '../../../src/tx-route-service-task';
import { TxTask } from '../../../src/tx-task';
import { R1Component } from './R1Component';
import { R2Component } from './R2Component';

import Application from './routepoint-client-application';

const PORT = 3002;
const port = process.env.PORT || PORT;
TxRoutePointRegistry.instance.setApplication(Application.instance.app);
new R1Component();
new R2Component();

const server = Application.instance.listen('localhost', +port, async () => {
  console.log(`[routepoint-client-main::listen] Listening at http://localhost:${port}/`);

  const R1 = await TxRoutePointRegistry.instance.get('GITHUB::R1');
  const R2 = await TxRoutePointRegistry.instance.get('GITHUB::R2');
  
  R2.reply().subscribe(
    (task: TxTask<any>) => {    
      console.log('[routepoint-client-main::listen] got reply from R2:', JSON.stringify(task.get(), undefined, 2));
    }
  );

  R1.reply().subscribe(
    (task: TxTask<any>) => {    
      console.log('[routepoint-client-main::listen] got reply from R1:', JSON.stringify(task.get(), undefined, 2));
    }
  );

  R2.tasks().next(new TxRouteServiceTask<any>({source: 'routepoint-client-main-R2'}, {from: 'clientRoutePoint-R2'}));  

  const reply = await R1.tasks().next(new TxRouteServiceTask<any>({source: 'routepoint-client-main-R1'}, {from: 'clientRoutePoint-R1'}));
  console.log('[routepoint-client-main] reply: ', JSON.stringify(reply.data, undefined, 2));
  
  server.close();
});
