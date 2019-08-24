
import { TxRouteServiceConfig }  from '../../../src/tx-route-service-config';
import { TxRoutePointRegistry } from '../../../src/tx-routepoint-registry';
import { TxRouteServiceTask } from '../../../src/tx-route-service-task';
import { TxTask } from '../../../src/tx-task';
import { R1Component } from './R1Component';

import Application from './routepoint-client-application';

const PORT = 3002;
const port = process.env.PORT || PORT;
TxRoutePointRegistry.instance.setApplication(Application.instance.app);
new R1Component();

const server = Application.instance.listen('localhost', +port, async () => {
  console.log(`[routepoint-client-main::listen] Listening at http://localhost:${port}/`);

  const routepoint = await TxRoutePointRegistry.instance.get('GITHUB::R1');
  const reply = await routepoint.tasks().next(new TxRouteServiceTask<any>({source: 'routepoint-client-main'}, {from: 'clientRoutePoint'}));

  console.log('[routepoint-client-main] reply: ', JSON.stringify(reply.data, undefined, 2));
  

  server.close();
});
