//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('Regsitry');

import { TxMountPoint } from './tx-mountpoint';

export class TxRegistry<T, K extends string | Symbol> {
  objects = new Map<K, T>();

  constructor() {    
  }

  add(name: K, object: T) {
    logger.info("[TxRegistry:add] adding object '" + name + "'" );
    this.objects.set(name, object);

    return object;
  }

  get(name: K) {
    logger.info(`[TxRegistry:get] getting object ${name}`);

    if ( ! this.objects.has(name) ) {
      throw ReferenceError(`object '${name}' is not exist in the registry`);
    }
    return this.objects.get(name);    
  }

  getNames() {
    let names = [];

    for (let key of this.objects.keys()) {
      names.push(key);
    }
    return names;
  }

  length() {
    return this.objects.size;
  }

}

