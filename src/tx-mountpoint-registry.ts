 
import { TxRegistry } from './tx-registry';
import { TxMountPoint } from './tx-mountpoint';
import { TxMountPointRxJS } from './tx-mountpoint-rxjs';

export class TxMountPointRegistry extends TxRegistry<TxMountPoint, string | Symbol> {
  private static _instance: TxMountPointRegistry;
    
  private constructor() {
    super();
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }   

  create(name: string | Symbol): TxMountPoint {
    const mp = new TxMountPointRxJS(name);

    if (typeof name === 'string') {
      if (name === undefined || name.length === 0) {
        return mp;
      }

      if (this.has(name)) {
        throw Error('already got mountpoint under the name ' + name);
      }

      return <TxMountPoint>this.add(name, mp);
    }

    if (name === undefined) {
      return mp;
    }

    if (this.has(name)) {
      throw Error('already got mountpoint under the name ' + name);
    }

    return <TxMountPoint>this.add(name, mp);
  }
}
