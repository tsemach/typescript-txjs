
type callback = () => void;

export interface TxConnector {
  subscribe: (dataCB: (any: any) => void, errorCB?: (any: any) => void, completeCB?: (any?: any) => void) => void

  listen(service, route);
  next(service: string, route: string, data: any);  
  error(service: string, route: string, data: any);  
  close(service: string, route?: string);
}
