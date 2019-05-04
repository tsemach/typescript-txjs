
import createLogger from 'logging';
const logger = createLogger('MultiPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxMountPoint } from './tx-mountpoint';
import { TxMultiPoint } from './tx-multipoint';
import { TxMountPointRegistry } from './tx-mountpoint-registry';

export class TxMultiPointRegistry {
  private static _instance: TxMultiPointRegistry;
    
  private constructor() {    
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  create<T>(name: string | Symbol): TxMultiPoint {
    const mp = new TxMultiPoint(name);

    if (typeof name === 'string') {
      if (name === undefined || name.length === 0) {
        return mp;
      }

      if (TxMountPointRegistry.instance.has(name)) {
        throw Error('already got singlepoint under the name ' + name.toString());
      }

      return <TxMultiPoint>TxMountPointRegistry.instance.add(name, mp);
    }

    if (name === undefined) {
      return mp;
    }

    if (TxMountPointRegistry.instance.has(name)) {
      throw Error('already got singlepoint under the name ' + name.toString());
    }

    return <TxMultiPoint>TxMountPointRegistry.instance.add(name, mp);
  }  
    
  new(name: string | Symbol, childs: (string | Symbol)[]) {
    const mp = TxMultiPointRegistry.instance.create(name);
    childs.forEach(n => mp.mountpoint(n))

    return TxMountPointRegistry.instance.get(name, '[TxMultiPointRegistry::get]');
  }  

  get(name: string | Symbol) {
    return TxMountPointRegistry.instance.get(name, '[TxMultiPointRegistry::get]');
  }

  del(name: string | Symbol) {
    return TxMountPointRegistry.instance.del(name);
  }
}
