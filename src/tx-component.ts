
import createLogger from 'logging'; 
  const logger = createLogger('TxComponent');

import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxMountPoint } from './tx-mountpoint';
import { TxTask } from './tx-task';

export function TxComponent(config) {
  return function(target) {    
    logger.info('[TxComponent:constructor] got target ' + typeof target + ' with config = ' + JSON.stringify(config));    
    target._mountpoint = TxMountPointRegistry.instance.create(config['selector']);

    Object.defineProperty(
      target.prototype,
      'mountpoint', {
      'value': () => { return target._mountpoint }
      }
    );

    target._mountpoint.tasks().subscribe(
      (task) => {
        target.prototype.tasks(task);        
      });

    target._mountpoint.undos().subscribe(
      (task) => {
        target.prototype.undos(task);        
      });
  
  }
}
