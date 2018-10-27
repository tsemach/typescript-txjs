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
  private _jobComponents = new Map<string, Set<string>>();
  private _serviceName = '';
  
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
  
  add(uuid: string, job: TxJob) {    
    job = super.add(uuid, job);
    this._jobComponents.set(job.getName(), new Set<string>());

    return job;
  }

  addComponent(job: string, mountpoint: string | Symbol) {
    let components = this._jobComponents.get(job);
    components.add(mountpoint.toString());
  }
  
  getJobs() {
      return this._jobComponents;    
  }

  getComponents(job: string) {
    return this._jobComponents.get(job);
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

  private get isRecordMap() {
    return this._isRecordMap;
  }

  setRecordFlag(name: string, flag: boolean) {
    this.isRecordMap.set(name, flag);
  }

  getRecordFlag(name: string): boolean {
    return this.isRecordMap.get(name);
  }

  setServiceName(name: string) {
    this._serviceName = name;
  }

  getServiceName() {
    return this._serviceName;
  }

}
