
import createLogger from 'logging';
const logger = createLogger('TxQueuePoint-Test');

import 'mocha';
import "reflect-metadata";

import {Q1Component} from "../C2C/Q1.component";
import {Q2Component} from "../C2C/Q2.component";

describe('Queue Point Class', () => {

  it('tx-quue-point-C2C.spec: check Q1Component <==> Q2Component C2C', async () => {
    logger.info('tx-quue-point-C2C.spec: check Q1Component <==> Q2Component C2C');
    let Q1 = new Q1Component();
    let Q2 = new Q2Component();

    await Q1.init();
    await Q2.init();
    await Q2.send();
  });

});