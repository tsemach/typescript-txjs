import logger = require('logging');
import { TxRegistry } from './tx-registry';
import { TxJob } from './tx-job';
import { TxJobPersistAdapter } from "./tx-job-persist-adapter";

/**
 * TxJobRegistry - is class store TxJob by their ids.
 */
export class TxJobRegistry extends TxRegistry<TxJob, string> {

  private static _instance: TxJobRegistry;
  private _driver: TxJobPersistAdapter = null;

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
    
    return this.add(job.uuid, job);
  }

  get driver() {
    return this._driver;
  }

  set driver(_driver: TxJobPersistAdapter) {
    this._driver = _driver;
  }

  async persist(job: TxJob) {
    if ( ! this.driver ) {
      throw 'try to persist but driver is null';
    }
    return await this.driver.save(job.uuid, job.toJSON(), job.getName());
  }

  async rebuild(uuid: string) {
    let json = await this.driver.read(uuid);

    return new TxJob().upJSON(json);
  }

  replace(oldUuid: string, newUuid: string, job: TxJob) {
    this.del(oldUuid);
    this.add(newUuid, job);
  }

}
