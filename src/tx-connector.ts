
export interface TxConnector {
  subscribe: (any) => void;

  connect(service, route);
  next(service: string, route: string, data: any);
  close();
}
