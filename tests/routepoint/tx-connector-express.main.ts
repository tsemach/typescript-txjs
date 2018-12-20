import createLogger from 'logging'; 
const logger = createLogger('ConnectorExpressTest');

import { TxTask } from './../../src/tx-task';
import { TxConnectorExpress } from "../../src/tx-connector-express";

async function main() {
  let express = new TxConnectorExpress();
  
  let service = await express.listen('localhost:3000', '/test');

  service.subscribe(
    (task) => {
      logger.info('[subscribe] got data from express connector: task = ' + JSON.stringify(task, undefined, 2))

      express.close('localhost:3000', '/test')
    });    
          
  express.next('localhost:3000', 'test', new TxTask<any>({from: 'test'}, {data: 'this is the data'}))
}

main();