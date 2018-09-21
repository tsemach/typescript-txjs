import logger = require('logging');
import { TxRegistry } from './tx-registry';
import { TxJob } from './tx-job';
import { TxJobPersistAdapter } from "./tx-job-persist-adapter";
import { TxRecordPersistAdapter } from "./tx-record-persist-adapter"

/**
 * TxJobRegistry - is class store TxJob by their ids.
 */
export class TxJobRegistry extends TxRegistry<TxJob, string> {

  private static _instance: TxJobRegistry;
  private _persistDriver: TxJobPersistAdapter = null;
  private _recorderDriver: TxRecordPersistAdapter = null;
  private _isRecordMap = new Map<string, boolean>();

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

  getPersistDriver() {
    return this._persistDriver;
  }

  setPersistDriver(_driver: TxJobPersistAdapter) {
    this._persistDriver = _driver;
  }

  async persist(job: TxJob) {
    if ( ! this.getPersistDriver() ) {
      throw 'try to persist but driver is null';
    }
    return await this.getPersistDriver().save(job.uuid, job.toJSON(), job.getName());
  }

  async rebuild(uuid: string) {

    let json = await this.getPersistDriver().read(uuid);
    //console.log("TxJobRegistry::rebuild : this.driver.read(uuid) = " + JSON.stringify(json, undefined, 2));
    return new TxJob().upJSON(json);
  }

  replace(oldUuid: string, newUuid: string, job: TxJob) {
    //console.log("TxJobRegistry::replace: oldUuid = " + oldUuid + ' newUuid = ' + newUuid);
    this.del(oldUuid);
    this.add(newUuid, job);
  }

  getRecorderDriver() {
    return this._recorderDriver;
  }

  setRecorderDriver(_recordDriver: TxRecordPersistAdapter) {
    this._recorderDriver = _recordDriver;
  }

  get isRecordMap() {
    return this._isRecordMap;
  }

  setRecordFlag(name: string, flag: boolean) {
    this.isRecordMap.set(name, flag);
  }

  getRecordFlag(name: string): boolean {
    return this.isRecordMap.get(name);
  }
}
