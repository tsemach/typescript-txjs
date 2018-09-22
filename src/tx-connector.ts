
export interface TxConnector {
  subscribe: (any) => void;

  register(service, route);
  next(service: string, route: string, data: any);
  close();
}
