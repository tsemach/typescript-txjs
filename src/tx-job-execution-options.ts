import { TxDirection } from './tx-direction';

/**
 * TxJobExecutionOptions - an object which effect the job execution.
 * options:
 * persist - {ison: boolean, destroy: boolean}
 *  ison - turn on / off job persistence mechanism.
 *  destroy - is destroy the job when persist
 * execute:
 *  until - run until reaching this mountpoint.
 *  source - from where to take the mountpoints needed to be run.
 * error:
 *  direction: TxDirection - what to direction move on compnents, forward | backword
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
    notify: {
      name: string;   // the name of the mountpoint needed to send reply
      from: string;   // the service name where need to notify
    }
  };
  error: {
    direction: TxDirection;
  };
  publish: 'local' | 'distribute';
}

const defaultExecutionOptions: TxJobExecutionOptions = {
  "persist": {
    "ison": false,
    "destroy": false
  },
  execute: {
    record: false
  },
  error: {
    direction: TxDirection.backward
  },
  publish: 'local'
} as TxJobExecutionOptions;
export { defaultExecutionOptions };

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
    if (options.execute === undefined) {
      return false;
    }
    if (options.execute.source === undefined) {
      return false;
    }
    
    return options.execute.source === 'service';
  }

  static isNotify(options: TxJobExecutionOptions) {
    if (options.execute === undefined) {
      return false;
    }
    if (options.execute.notify === undefined) {
      return false;
    }

    if ( ! options.execute.notify.hasOwnProperty('from') ) {
      return false;
    }
    
    if ( ! options.execute.notify.hasOwnProperty('name') ) {
      return false;
    }

    return true;
  }

  static isDisribute(options: TxJobExecutionOptions) {
    if (options.publish === undefined) {
      return false;
    }
    if (options.publish === 'local') {
      return false;
    }
    if (options.publish === 'distribute') {
      return true;
    }
    throw Error(`unknown publish option: ${options.publish}`);
  }

  static getErrorDirection(options: TxJobExecutionOptions) {
    if (options.error === undefined) {
      return TxDirection.backward;
    }
    if (options.error.direction === undefined) {
      return TxDirection.backward;
    }

    return options.error.direction;
  }
}