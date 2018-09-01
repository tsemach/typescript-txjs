import {TxJobRegistry} from "./tx-job-resgitry";

/**
 * TxJobExecutionOptions - an object which effect the job execution.
 * options:
 * persist - {ison: boolean, destroy: boolean}
 *  ison - turn on / off job persistence mechanism.
 *  destroy - is destroy the job when persist
 * execute:
 *  until - run until reaching this mountpoint.
 */
export interface TxJobExecutionOptions {
  persist: {
    ison: boolean;
    destroy: boolean;
  };
  execute: {
    until: string;
  }
}

export class TxJobExecutionOptionsChecker {
  constructor() {
  }

  static isPersist(options: TxJobExecutionOptions) {
    if (options.persist === undefined ) {
      return false;
    }
    if (options.persist.ison === undefined) {
      return false;
    }
    return options.persist.ison === true;
  }

  static isUntil(options, name: string) {
    if (options.execute === undefined ) {
      return false;
    }
    if (options.execute.until === undefined) {
      return false;
    }
    return options.execute.until === name;
  }

  static isDestroy(options) {
    if ( ! TxJobExecutionOptionsChecker.isPersist(options) ) {
      return false;
    }
    return TxJobExecutionOptionsChecker.isTrue(options.persist, 'destroy');
  }

  static isTrue(o, p) {
    return o.hasOwnProperty(p) && o[p] === true;
  }

}