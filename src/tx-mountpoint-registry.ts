//import logger = require('logging');
import createLogger from 'logging';
 
const logger = createLogger('MountPointRegistry');

import { TxRegistry } from './tx-registry';
import { TxMountPoint } from './tx-mountpoint';

export class TxMountPointRegistry extends TxRegistry<TxMountPoint> {
  private static _instance: TxMountPointRegistry;

  private constructor() {
    super();
  }

  public static get instance() {
    return this._instance || (this._instance = new this());
  }

  create(name = '') {
    const mp = new TxMountPoint(name);

    if (name === undefined || name.length === 0) {
      return mp;
    }
    return this.add(name, mp);
  }
}
