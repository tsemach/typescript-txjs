 
import { TxRegistry } from './tx-registry';
import { TxMountPoint } from './tx-mountpoint';

export class TxMountPointRegistry extends TxRegistry<TxMountPoint, string | Symbol> {
  private static _instance: TxMountPointRegistry;
    
  private constructor() {
    super();
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }   
}
