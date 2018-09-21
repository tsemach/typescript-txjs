import { Subject } from 'rxjs/Subject'

/**
 * TxMountPoint: class is usually used by a component. 

It is a meeting point between two totally different components.
It support two communication between components.

A component receive task by the mount-point's tasks Subject and return reply by reply subject.     
 */
export interface TxMountPoint {
  name: string | Symbol;
  reply(): any;
  tasks(): any;
  undos(): any;
}
