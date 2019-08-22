
export type TxRouteServiceConfigMode =  'server' | 'client';
export type TxRouteServiceConfigMethod = 'get' | 'GET' | 'port' | 'POST' | 'put' | 'PUT' | 'delete' | 'DELETE';

export interface TxRouteServiceConfig {
  mode?: TxRouteServiceConfigMode;    // define if run on server or client side
  host: string                        // host name / ip where the service is clocating
  port: number                        // port number where the service is locating
  //method: TxRouteServiceConfigMethod; // the http method to use GET, PORT, PUT, DELTE ..
  method: string;											 // the http method to use GET, PORT, PUT, DELTE ..
  service: string;                    // the route point represent a service like, /usr
  route: string;                      // a specific route under a service like /usr/add, /usr/del
}
