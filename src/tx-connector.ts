
type callback = () => void;

export interface TxConnector {
//  subscribe2: (any) => void

  subscribe: (dataCB: (any: any) => void, errorCB?: (any: any) => void) => void

  register(service, route);
  next(service: string, route: string, data: any);  
  error(service: string, route: string, data: any);  
  close();
}

export interface TxConnector2 {
  subscribe2: (dataCB: (any: any) => void, errorCB?: (any: any) => void) => void
}

class C implements TxConnector2 {
  subscribe2(dataCB: (any: any) => void, errorCB?: (any: any) => void)  {

  }
  

}

let c = new C();

c.subscribe2(
  (data) => {
    console.log('c: data');
  },
  (error) => {
    console.log('c: error');
  }

)

