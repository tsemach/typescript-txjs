

export interface TxJobComponentOptions {
  wait: boolean;
  waitfor: string | Symbol[];
  timeout: number;
  retry: number;
}

let defaultComponentOptions: TxJobComponentOptions = {
  wait: true,
  waitfor: [],
  timeout: 0,
  retry: 0
} as TxJobComponentOptions;
export { defaultComponentOptions };

export class TxJobComponentOptionsChecker {
  constructor() {
  }

  static isWait(options: TxJobComponentOptions) {
    if (options.wait === undefined ) {
      return false;
    }
    
    return options.wait;
  }

  static isWaitFor(options: TxJobComponentOptions) {
    if (options.waitfor === undefined ) {
      return false;
    }
    return options.waitfor.length > 0;
  }

  static isTimeOut(options: TxJobComponentOptions) {
    if (options.timeout === undefined) {
      return false;
    }
    return options.timeout > 0;
  }

  static isRetry(options: TxJobComponentOptions) {
    if (options.retry === undefined) {
      return false;
    }
    return options.retry > 0;
  }

}
