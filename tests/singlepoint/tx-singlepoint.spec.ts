
import createLogger from 'logging'; 
const logger = createLogger('MountPoint-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import { TxMountPointRegistry } from '../../src/tx-mountpoint-registry';
import { TxTask } from '../../src/tx-task';
import { TxSinglePoint } from '../../src/tx-singlepoint';

describe('Single Point Class', () => {

  it('tx-singlepoint.spec: simple subscribe tasks test', (done) => {
    logger.info('tx-singlepoint.spec: simple subscribe tasks test')

    let singlepoint: TxSinglePoint = <TxSinglePoint>TxMountPointRegistry.instance.create('GITHUB::GIST::C1');

    singlepoint.tasks().subscribe(
      (task) => {
        logger.info('[GITHUB::GIST::C1:tasks] got task = ' + JSON.stringify(task, undefined, 2));

        let expected = {
          head: {
            name: "simple",
            type: "test"
          },
          data: {
            from: "tsemach, more data here"
          }
        }
        assert.deepEqual(expected, task.get());
        
        done();
      }
    )   
    singlepoint.tasks().next(new TxTask({name: 'simple', type: 'test'}, {from: 'tsemach, more data here'}))

  });

  it('tx-singlepoint.spec: singlepoint with reply subscribe tasks test', (done) => {
    logger.info('tx-singlepoint.spec: singlepoint with reply subscribe tasks test')

    let recver: TxSinglePoint = <TxSinglePoint>TxMountPointRegistry.instance.create('GITHUB::RECVER');
    let sender: TxSinglePoint = <TxSinglePoint>TxMountPointRegistry.instance.create('GITHUB::SENDER');

    recver.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[GITHUB::RECVER] got task = ' + JSON.stringify(task.get(), undefined, 2));

        let expected = {
          head: {
            name: "sender",
            type: "test"
          },
          data: {
            from: "sender, more data here"
          }
        }
        assert.deepEqual(expected, task.get());

        task.reply().next(new TxTask({name: "simple", type: "test"}, {from: "recver"}))        
      }
    )   

    sender.tasks().subscribe(
      (task) => {
        logger.info('[GITHUB::SENDER] got task = ' + JSON.stringify(task, undefined, 2));

        let expected = {
          head: {name: "simple", type: "test"},
          data: {from: "recver"}
        }
        assert.deepEqual(expected, task.get());

        done();
      }
    )
    
    recver.tasks().next(new TxTask(
      {name: 'sender', type: 'test'},
      {from: 'sender, more data here'},
      sender
      )      
    )

  });

  it('tx-singlepoint.spec: multiple reciever of the same singlepoints test', (done) => {
    logger.info('tx-singlepoint.spec: multiple singlepoints test')

    let recver: TxSinglePoint = <TxSinglePoint>TxMountPointRegistry.instance.create('GITHUB::RECVER');
    let sender: TxSinglePoint = <TxSinglePoint>TxMountPointRegistry.instance.create('GITHUB::SENDER');
    let receivers = 0;

    recver.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[GITHUB::RECVER] got task = ' + JSON.stringify(task.get(), undefined, 2));

        let expected = {
          head: {
            name: "sender",
            type: "test"
          },
          data: {
            from: "sender, more data here"
          }
        }
        assert.deepEqual(expected, task.get());

        task.reply().next(new TxTask({name: "simple", type: "test"}, {from: "recver"}))        
      }
    )   

    sender.tasks().subscribe(
      (task) => {
        logger.info('[GITHUB::SENDER] [1] got task = ' + JSON.stringify(task, undefined, 2));

        let expected = {
          head: {name: "simple", type: "test"},
          data: {from: "recver"}
        }
        assert.deepEqual(expected, task.get());
        
        receivers++;        
        if (receivers >= 2) {
          logger.info('[GITHUB::SENDER] [1] receivers = ' + receivers);
          done();
        }
      }
    )

    sender.tasks().subscribe(
      (task) => {
        logger.info('[GITHUB::SENDER] [2] got task = ' + JSON.stringify(task, undefined, 2));

        let expected = {
          head: {name: "simple", type: "test"},
          data: {from: "recver"}
        }
        assert.deepEqual(expected, task.get());
        
        receivers++;        
        if (receivers >= 2) {
          logger.info('[GITHUB::SENDER] [2] receivers = ' + receivers);
          done();
        }
      }
    )

    recver.tasks().next(new TxTask(
      {name: 'sender', type: 'test'},
      {from: 'sender, more data here'},
      sender
      )      
    )

  });

  it('tx-singlepoint.spec: multiple reciever listen on differnet singlepoints test', (done) => {
    logger.info('tx-singlepoint.spec: multiple singlepoints listen on differnet singlepoints test')

    let recver: TxSinglePoint = <TxSinglePoint>TxMountPointRegistry.instance.create('GITHUB::RECVER');
    let send_1: TxSinglePoint = <TxSinglePoint>TxMountPointRegistry.instance.create('GITHUB::SEND-1');
    let send_2: TxSinglePoint = <TxSinglePoint>TxMountPointRegistry.instance.create('GITHUB::SEND-2');    

    let send_1_ok = false;
    let send_2_ok = false;

    let send_1_task = {
      head: {
        name: 'send_1', 
        type: 'test'
      },
      data: {
        from: 'send_1, more data here'
      }
    }

    let send_2_task = {
      head: {
        name: 'send_2', 
        type: 'test'
      },
      data: {
        from: 'send_2, more data here'
      }
    }

    recver.tasks().subscribe(
      (task: TxTask<any>) => {
        logger.info('[GITHUB::RECVER] got task = ' + JSON.stringify(task.get(), undefined, 2));
     
        if (task.head.name === 'send_1') {
          assert.deepEqual(send_1_task, task.get());
        }

        if (task.head.name === 'send_2') {
          assert.deepEqual(send_2_task, task.get());
        }
        
        task.reply().next(new TxTask(
          {
            name: "recver",
            from: task.head.name
          },
          task.data          
        ))
      }
    )   

    send_1.tasks().subscribe(
      (task) => {
        logger.info('[GITHUB::SEND_1] [1] got task = ' + JSON.stringify(task.get(), undefined, 2));

        let expected = {
          head: {
            name: "recver",
            from: "send_1"
          },
          data: {
            from: "send_1, more data here"
          }
        }
        assert.deepEqual(expected, task.get());
        send_1_ok = true;

        if (send_1_ok && send_2_ok) {
          done();
        }

      }
    )

    send_2.tasks().subscribe(
      (task) => {
        logger.info('[GITHUB::SEND_2] [2] got task = ' + JSON.stringify(task.get(), undefined, 2));

        let expected = {
          head: {
            name: "recver",
            from: "send_2"
          },
          data: {
            from: "send_2, more data here"
          }
        }
        assert.deepEqual(expected, task.get());
        send_2_ok = true;

        if (send_1_ok && send_2_ok) {
          done();
        }

      }
    )

    recver.tasks().next(new TxTask(send_1_task.head, send_1_task.data, send_1));
    recver.tasks().next(new TxTask(send_2_task.head, send_2_task.data, send_2));

  });

});