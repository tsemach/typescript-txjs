
import createLogger from 'logging'; 
const logger = createLogger('TxComponent');

import { TxMountPointRegistry } from './tx-mountpoint-registry';
import { TxMountPoint } from './tx-mountpoint';
import { TxTask } from './tx-task';

export function TxComponent(config) {
  return function(target) {
    logger.info('[TxComponent:constructor] target = ' + target);
    logger.info('[TxComponent:constructor] config = ' + JSON.stringify(config));

    logger.info('[TxComponent:tasks] DECORATOR about to add mountpoint property');
    target.mountpoint = TxMountPointRegistry.instance.create(config['selector']);

    Object.defineProperty(
      target.prototype,
      'mountpoint', {
      'value': () => { return target.mountpoint }
      }
    );


    // Object.defineProperty(
    //   target,
    //   'mountpoint',
    //   {
    //     'value': TxMountPointRegistry.instance.create(config['selector']),
    //     writable: false,
    //   }
    // )
    
    logger.info('[TxComponent:tasks] DECORATOR after adding mount point: target = ' + target);

    // this is an example of adding method to the class
    // target.prototype.sayHello = function(... args) {
    //   logger.info('[Component:sayHello] config = ' + JSON.stringify(config));     
    //   logger.info('[Component:sayHello] args = ' + JSON.stringify(args));     
    // }       
    
    // this is an example of adding method to the class 
    // using Object.defineProperty
    Object.defineProperty(
      target.prototype,
      config['tasks'],
      (data) => function(... args) {
        logger.info('[Component:tasks] config = ' + JSON.stringify(config));     
        logger.info('[Component:tasks] data = ' + JSON.stringify(args));     
    });

    target.mountpoint.tasks().subscribe(
      (task) => {
        logger.info('[TxComponent:tasks] DECORATOR got task = ' + JSON.stringify(task, undefined, 2));                  
        target.prototype.tasks(task);
      });

    // Object.defineProperty(
    //   target.prototype,
    //   config['undos'],
    //   (data) => function(... args) {
    //     logger.info('[Component:undos] config = ' + JSON.stringify(config));     
    //     logger.info('[Component:undos] data = ' + JSON.stringify(args));     
    // });

    // target.mountpoint.undos().subscribe(
    //   (task) => {
    //     logger.info('[TxComponent:undos] got task = ' + JSON.stringify(task, undefined, 2));                  
    //     target.prototype.undos(task);
    //   });
  
    // let a = 1;
    // if (a == 1)     {
    //   target.prototype.tasks({data: 'this is data'});
    // }
    console.log("In component: after definePropert " + target);
  }
}
