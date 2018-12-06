
import createLogger from 'logging';
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxMountPoint } from './tx-mountpoint';
import { TxSinglePointRxJS } from './tx-singlepoint-rxjs';

export class TxSinglePointRegistry extends TxRegistry<TxMountPoint, string | Symbol> {
  private static _instance: TxSinglePointRegistry;
    
  private constructor() {
    super();
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  create(name: string | Symbol): TxMountPoint {
    const sp = new TxSinglePointRxJS(name);

    if (typeof name === 'string') {
      if (name === undefined || name.length === 0) {
        return sp;
      }

      if (this.has(name)) {
        throw Error('already got singlepoint under the name ' + name);
      }

      return <TxMountPoint>this.add(name, sp);
    }

    if (name === undefined) {
      return sp;
    }

    if (this.has(name)) {
      throw Error('already got singlepoint under the name ' + name);
    }

    return <TxMountPoint>this.add(name, sp);
  }
    
}
