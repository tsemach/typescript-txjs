
import createLogger from 'logging';
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxMountPoint } from './tx-mountpoint';
import { TxSinglePoint } from './tx-singlepoint';
import { TxDoublePoint } from './tx-doublepoint';
import { TxMountPointRegistry } from './tx-mountpoint-registry';

export class TxSinglePointRegistry {
  private static _instance: TxSinglePointRegistry;
  
  private constructor() {
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

      if (TxMountPointRegistry.instance.has(name)) {
        throw Error('already got singlepoint under the name ' + name.toString());
      }

      return <TxMountPoint>TxMountPointRegistry.instance.add(name, sp, 'TxSinglePointRegistry');
    }

    if (name === undefined) {
      return sp;
    }

    if (TxMountPointRegistry.instance.has(name)) {
      throw Error('already got singlepoint under the name ' + name.toString());
    }

    TxMountPointRegistry.instance.add(name, sp, 'TxSinglePointRegistry');

    return <TxMountPoint>TxMountPointRegistry.instance.add(name, sp, 'TxSinglePointRegistry');
  }  

  get(name: string | Symbol) {    
    return TxMountPointRegistry.instance.get(name);
  }

  has(name: string | Symbol) {
    return TxMountPointRegistry.instance.has(name);
  }

  del(name: string | Symbol) {      
    return TxMountPointRegistry.instance.del(name);
  }
  double(name: string | Symbol, suffix = '') {
    logger.info(`[TxRegistry:get] getting object ${name.toString()}`);    

    return new TxDoublePoint(TxMountPointRegistry.instance.get(name), 'TxSinglePointRegistry');
  }
    
}
