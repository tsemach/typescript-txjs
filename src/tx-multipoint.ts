import createLogger from 'logging'; 
const logger = createLogger('MultiPoint');

import { TxMountPoint } from './tx-mountpoint';
import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxSinglePoint } from './tx-singlepoint';

export class TxMultiPoint implements TxMountPoint {
  type = 'TxMultiPoint';

  private _names = new Set<string | Symbol>();
  private _points = new Map<string | Symbol, TxMountPoint>();
  
  constructor(private _name: string | Symbol) {  
  }

  get name() {
    if (typeof this._name === 'string') {
      return this._name;
    }
    return this._name.toString();
  }

  tasks() {
    throw new Error(`tasks() is not implement with TxMultiPoint, use get(name) to get a proper TxMountPoint`);
  }

  reply() {    
    throw new Error(`reply() is not implement with TxMultiPoint, use get(name) to get a proper TxMountPoint`);
  }

  undos() {
    throw new Error(`undos() is not implement with TxMultiPoint, use get(name) to get a proper TxMountPoint`);
  }

  get names() {
    return this._names;
  }

  mountpoint(name: string | Symbol) {
    this.names.add(name);

    return this;
  }

  add(mountpoint: TxMountPoint) {        
    this._points.set(mountpoint.name, mountpoint);
  }    

  // addName(name: string | Symbol) {        
  //   const instance = TxMountPointRegistry.instance.get(name);
  //   this._points.set(instance.name, instance);    

  //   return this;
  // }

  get(name: string | Symbol) {
    if ( ! this._points.has(name) ) {
      throw new Error(`ERROR: unable to find ${name} mountpoint`)
    }

    return this._points.get(name);
  }

  has(name: string | Symbol) {
    return this._points.has(name);
  }
  // isStringOrSymbol(name: string | Symbol): name is string | Symbol {
  //   if (typeof name === 'string') {
  //     return true;
  //   }
  //   if (typeof name === 'symbol') {
  //     return true;
  //   }

  //   return false;
  // }
}