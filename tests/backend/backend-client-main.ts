import { TxRoutePointRegistry } from './../../src/tx-routepoint-registry';
import axios from 'axios';

import { TxRouteServiceExpressGet } from '../../src/tx-route-service-express-get';
import { TxRouteServiceConfig }  from '../../src/tx-route-service-config';
import { TxRouteServiceTask } from '../../src/tx-route-service-task';
import { TxRouteApplication } from '../../src/tx-route-application';
import { TxTask } from '../../src/tx-task';

import Application from './backend-application'

const config: TxRouteServiceConfig = {
  host: 'localhost',
  port: 3100,
  method: 'get',
  service: 'sanity',
  route: 'save'
}

function clientSubscribeServiceGet() {
  console.log('[backend-client-main] subscribeServiceGet is called');

  const service = new TxRouteServiceExpressGet(new TxRouteApplication(Application.instance.app), config);
  service.subscribe(
    (task: TxRouteServiceTask<any>) => {
      console.log('[backend-client-main] service subscribe called, tasks:', JSON.stringify(task.get(), undefined, 2));
    }
  )

  service.next(new TxRouteServiceTask<any>({source: 'back-client-main'}, {from: 'sendServiceGet'}));
}

async function clientRoutePoint() {
  console.log("[clientRoutePoint] called ..")
  // this two line is done nternaly by the publication service
  config.mode = 'client';
  console.log("going to create");
  TxRoutePointRegistry.instance.create('GITHUB::R1', config)
  //-----------------------------------------------------------

  console.log("going to get");
  const routepoint = await TxRoutePointRegistry.instance.get('GITHUB::R1');
  console.log("routepoint=", JSON.stringify(routepoint));
  const reply = routepoint.tasks().next(new TxRouteServiceTask<any>({source: 'back-client-main'}, {from: 'clientRoutePoint'}));

  console.log('[backend-client-main] reply: ', JSON.stringify(reply, undefined, 2));  
}

async function sendAndSubscribeServiceGet() {
  const config: TxRouteServiceConfig = {
    host: 'localhost',
    port: 3100,
    method: 'get',
    service: 'sanity',
    route: 'save'
  }

  const service = new TxRouteServiceExpressGet(Application.instance, config);

  service.subscribe(
    (task: TxTask<any>) => {
      console.log('[sendAndSubscribeServiceGet] got reply from service: ', JSON.stringify(task, undefined, 2));
    }
  );
  const reply = service.next(new TxRouteServiceTask<any>({source: 'back-client-main'}, {from: 'sendAndSubscribeServiceGet'}));

  console.log('[backend-client-main] reply: ', JSON.stringify(reply, undefined, 2));
}

const port = process.env.PORT || 3101;
TxRoutePointRegistry.instance.setApplication(Application.instance.app)

Application.instance.listen('localhost', +port, () => {
  console.log(`[BackendApplication::listen] Listening at http://localhost:${port}/`);
  if (process.argv[2] === 'subscribe') {
    clientSubscribeServiceGet();  
  }

  if (process.argv[2] === 'client') {
    clientRoutePoint();  
  }

  if (process.argv[2] === 'send-and-subscribe') {  
    sendAndSubscribeServiceGet();
  }
});
