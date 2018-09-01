
/**
 * a persist driver stub (emulate some persist storage)
 */
import createLogger from 'logging';
const logger = createLogger('Persist-Driver-Test');

import {TxJobPersistAdapter} from "../../src/tx-job-persist-adapter";
import {TxJobJSON} from "../../src/tx-job-json";

export class Persist implements TxJobPersistAdapter {
  jobs = new Map<string, TxJobJSON>();

  read(uuid: string): TxJobJSON {
    logger.info('[Persist:read] uuid = ' + uuid);

    return this.jobs.get(uuid);
  }

  save(uuid: string, json: TxJobJSON, name?: string): boolean {
    logger.info("saving: name = " + name);
    logger.info("saving: uuid = " + uuid);
    logger.info("saving: data = " + JSON.stringify(json));

    this.jobs.set(uuid, json);

    return true;
  }
}
