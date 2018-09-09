
export interface TxConnector {
  connect(service, route);
  subscribe: (any) => void;
  next(any);
}
