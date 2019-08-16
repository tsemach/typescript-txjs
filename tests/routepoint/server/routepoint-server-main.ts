
import { TxRoutePointRegistry } from '../../../src/tx-routepoint-registry';;
import { R1Component } from './R1Component';

import Application from './routepoint-server-application';

const PORT = 3001;
const port = process.env.PORT || PORT;
TxRoutePointRegistry.instance.setApplication(Application.instance.app);

new R1Component();

Application.instance.listen('localhost', +port, () => {
  console.log(`[backend-server-main::listen] Listening at http://localhost:${port}/`);  
});
