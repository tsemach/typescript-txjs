
export interface Jobs {
  service:    string;
  components: string[]
}

export interface Connector {
  mode: string;   // route | queue: type of the connector
  host: string;   // hostname | ip | queue of the remote service need to connect
  port: string;   // port number in case of express connector
  path: string;   // parh | route: path in case of express connector, route (topic) in case of queue
}

export interface Connectors {
  service: string;
  connector: Connector;
}

export interface TxJobServicesJSON {
  stack:      string[];
  trace:      string[];
  block:      string[];
  current:    string;
  jobs:       Jobs[];
  connectors: Connectors[]
}

export const TxJobServicesEmptyJSON =  {
  "stack": [],
  "trace": [],
  "block": [],
  "current": "",
  "jobs": [],
  "connectors": []
}
