import logger = require('logging');
import { TxRegistry } from './tx-registry';
import { TxJob } from './tx-job';

/**
 * TxJobRegistry - is class store TxJob by their names.
 */
export class TxJobRegistry extends TxRegistry<TxJob, string> {
  private static _instance: TxJobRegistry

  private constructor() {
    super();
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  create(name = '') {
    const job = new TxJob(name);

    if (name === undefined || name.length === 0) {
      return job;
    }
    
    return this.add(name, job);
  }
}
