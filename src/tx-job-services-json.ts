export interface Jobs {
  service:    string;
  components: string[]
}

export interface TxJobServicesJSON {
  stack:   string[];
  trace:   string[];
  block:   string[];
  current: string;
  jobs:    Jobs[];
}

export const TxJobServicesEmptyJSON =  {
  "stack": [],
  "trace": [],
  "block": [],
  "current": "",
  "jobs": []
}
