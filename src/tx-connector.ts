
type callback = () => void;

export interface TxConnector {
  subscribe: (dataCB: (any: any) => void, errorCB?: (any: any) => void, completeCB?: (any?: any) => void) => void

  listen(service: string, route: string): any;
  next(service: string, route: string, data: any): any;  
  error(service: string, route: string, data: any): any;  
  close(service: string, route?: string): any;
}
