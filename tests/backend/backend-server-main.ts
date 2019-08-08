
import { TxRouteServiceExpressGet } from '../../src/tx-route-service-express-get';
import { TxRouteServiceConfig }  from '../../src/tx-route-service-config';
import { TxRoutePointRegistry } from '../../src/tx-routepoint-registry';
import { TxRouteServiceTask } from '../../src/tx-route-service-task';
import { TxTask } from '../../src/tx-task';
import { R1Component } from './R1Component';

import Application from './backend-application'

function serverSubscribeServiceGet() {
  console.log('[backend-server-main] subscribeServiceGet is called');

  const config: TxRouteServiceConfig = {
    host: 'localhost',
    port: 3101,
    method: 'get',
    service: 'sanity',
    route: 'save'
  }

  const service = new TxRouteServiceExpressGet(Application.instance, config);
  service.subscribe(
    (task: TxRouteServiceTask<any>) => {
      console.log('[backend-server-main] service subscribe called, task:', JSON.stringify(task.get(), undefined, 2));

      task.reply().next(new TxRouteServiceTask<any>({
        headers: {
          source: 'back-application-main',
          token: '123456780ABCDEF'
        },
        response: {
          status: 200,
          type: 'json'
        }},
        {
          source: 'back-server-main', status: "ok"
        }
      ));      
    }
  )  
}

async function serverRoutePoint() {
  console.log('[backend-server-main] init R1Component');
  new R1Component();
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
  const reply = service.next(new TxRouteServiceTask<any>({source: 'back-application-main'}, {from: 'sendAndSubscribeServiceGet'}));

  console.log('[backend-server-main] reply: ', JSON.stringify(reply, undefined, 2));  
}

const port = process.env.PORT || 3100;

TxRoutePointRegistry.instance.setApplication(Application.instance.app)

Application.instance.listen('localhost', +port, () => {
  console.log(`[backend-server-main::listen] Listening at http://localhost:${port}/`);
  if (process.argv[2] === 'subscribe') {
    serverSubscribeServiceGet();  
  }

  if (process.argv[2] === 'routepoint') {
    serverRoutePoint();  
  }

  if (process.argv[2] === 'send-and-subscribe') {  
    sendAndSubscribeServiceGet();
  }
});
