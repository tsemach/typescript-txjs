import logger = require('logging');
import { TxRegistry } from './tx-registry';
import { TxJob } from './tx-job';
import { TxJobPersistAdapter } from "./tx-job-persist-adapter";

/**
 * TxJobRegistry - is class store TxJob by their ids.
 */
export class TxJobRegistry extends TxRegistry<TxJob, string> {

  private static _instance: TxJobRegistry;
  private driver: TxJobPersistAdapter = null;

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

  setDriver(driver: TxJobPersistAdapter) {
    this.driver = driver;
  }

  async persist(job: TxJob) {
1    await this.driver.save(job.uuid, job.toJSON(), job.getName());
  }

  async rebuild(uuid: 'string') {
    let json = await this.driver.read(uuid);

    let job = new TxJob();
    job.upJSON(json);
  }
}
