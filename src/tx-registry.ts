//import logger = require('logging');
import createLogger from 'logging'; 
const logger = createLogger('Regsitry');

/**
 * objects - store mountpoints by string | Symbol
 * names - store name.toString() of a key to the key itself. In case of string key
 * the two is the same but in case the key is a Symbol then it map the Symbol.toString()
 * to the symbol itself.
 */
export class TxRegistry<T, K extends string | Symbol> {
  objects = new Map<K, T>();
  names = new Map<string, K>();

  constructor() {    
  }

  add(name: K, object: T) {
    logger.info("[TxRegistry:add] adding object '" + name.toString() + "'" );
    this.objects.set(name, object);
    this.names.set(name.toString(), name);

    return object;
  }

  get(name: K) {
    logger.info(`[TxRegistry:get] getting object ${name.toString()}`);

    /**
     * in case of name like 'Symbol(SOME-NAME)' then it is coming from serialize
     * (upJSON method of TxJob).
     */
    if (typeof name === 'string') {
      if (this.names.has(name)) {
        return this.objects.get(this.names.get(name));
      }
    }

    if ( ! this.objects.has(name) ) {
      throw ReferenceError(`object '${name.toString()}' is not exist in the registry`);
    }
    return this.objects.get(name);    
  }

  has(name: K) {
    if (typeof name === 'string') {
      if (this.names.has(name)) {
        return this.objects.has(this.names.get(name));
      }
    }

    return this.objects.has(name);
  }

  del(name: K) {
    console.log("REGISTRY:DEL: name = " + name);
    this.objects.delete(name);
    this.names.delete(name.toString());
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

