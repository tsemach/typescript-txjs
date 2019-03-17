
/**
 * a persist driver stub (emulate some persist storage)
 */
import createLogger from 'logging';
const logger = createLogger('Persist-Driver-Test');

import {TxJobPersistAdapter} from "../../src";
import {TxJobJSON} from "../../src";

export class Persist implements TxJobPersistAdapter {
  jobs = new Map<string, TxJobJSON>();

  read(uuid: string): Promise<TxJobJSON> {
    logger.info('[Persist:read] uuid = ' + uuid);

    return this.jobs.get(uuid);
  }

  save(uuid: string, json: TxJobJSON, name?: string): boolean {
    logger.info("saving: name = " + name);
    logger.info("saving: uuid = " + uuid);
    logger.info("saving: data = " + JSON.stringify(json, undefined, 2));

    this.jobs.set(uuid, json);

    return true;
  }
}
