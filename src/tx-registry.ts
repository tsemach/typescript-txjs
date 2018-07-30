//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('FeatureName');

import { TxMountPoint } from './tx-mountpoint';

export class TxRegistry<T> {
  objects = new Map<string, T>();

  constructor() {    
  }

  add(name: string, object: T) {
    logger.info("[TxRegistry:add] adding object '" + name + "'" );
    this.objects.set(name, object);

    return object;
  }

  get(name) {
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

