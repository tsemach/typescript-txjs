import {TxJobRegistry} from "./tx-job-resgitry";

/**
 * TxJobExecutionOptions - an object which effect the job execution.
 * options:
 * persist - {ison: boolean, destroy: boolean}
 *  ison - turn on / off job persistence mechanism.
 *  destroy - is destroy the job when persist
 * execute:
 *  until - run until reaching this mountpoint.
 *  source - from where to take the mountpoints needed to be run.
 */
export interface TxJobExecutionOptions {
  persist: {
    ison: boolean;
    destroy: boolean;
  };
  execute: {
    until: string;
    record: boolean;
    source: string;
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

  static isUntil(options: TxJobExecutionOptions, name: string) {
    if (options.execute === undefined ) {
      return false;
    }
    if (options.execute.until === undefined) {
      return false;
    }
    return options.execute.until === name;
  }

  static isDestroy(options: TxJobExecutionOptions) {
    if ( ! TxJobExecutionOptionsChecker.isPersist(options) ) {
      return false;
    }
    return TxJobExecutionOptionsChecker.isTrue(options.persist, 'destroy');
  }

  static isTrue(o, p) {
    return o.hasOwnProperty(p) && o[p] === true;
  }

  static isRecord(options: TxJobExecutionOptions) {
    if ( ! TxJobExecutionOptionsChecker.isRecordDefine(options) ) {
      return false;
    }
    return options.execute.record;
  }

  static isRecordDefine(options: TxJobExecutionOptions) {
    if (options.execute === undefined) {
      return false;
    }
    return options.execute.record !== undefined;
  }

  static isService(options: TxJobExecutionOptions) {
    console.log("IN IS_SERVICE")
    if (options.execute === undefined) {
      console.log("IN IS_SERVICE: false")
      return false;
    }
    if (options.execute.source === undefined) {
      console.log("IN IS_SERVICE: false flase")
      return false;
    }
    console.log("IN IS_SERVICE: options.execute.source = ", options.execute.source )
    return options.execute.source === 'service';
  }

}