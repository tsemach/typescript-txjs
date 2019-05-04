
import createLogger from 'logging';
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxMountPoint } from './tx-mountpoint';
import { TxSinglePoint } from './tx-singlepoint';
import { TxDoublePoint } from './tx-doublepoint';
import { TxMountPointRegistry } from './tx-mountpoint-registry';

export class TxSinglePointRegistry extends TxRegistry<TxMountPoint, string | Symbol> {
  private static _instance: TxSinglePointRegistry;
  
  private constructor() {
    super();
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  create<T>(name: string | Symbol): TxMountPoint {
    const sp = new TxSinglePoint<T>(name);

    if (typeof name === 'string') {
      if (name === undefined || name.length === 0) {
        return sp;
      }

      if (this.has(name)) {
        throw Error('already got singlepoint under the name ' + name.toString());
      }

      // until all *PointRegistry will save their mountpoint with in TxMountRegistry.
      TxMountPointRegistry.instance.add(name, sp, 'TxSinglePointRegistry');

      return <TxMountPoint>this.add(name, sp, 'TxSinglePointRegistry');
    }

    if (name === undefined) {
      return sp;
    }

    if (this.has(name)) {
      throw Error('already got singlepoint under the name ' + name.toString());
    }

    // until all *PointRegistry will save their mountpoint with in TxMountRegistry.
    TxMountPointRegistry.instance.add(name, sp, 'TxSinglePointRegistry');

    return <TxMountPoint>this.add(name, sp, 'TxSinglePointRegistry');
  }  

  double(name: string | Symbol, suffix = '') {
    logger.info(`[TxRegistry:get] getting object ${name.toString()}`);    

    return new TxDoublePoint(this.get(name), 'TxSinglePointRegistry');
  }
    
}
