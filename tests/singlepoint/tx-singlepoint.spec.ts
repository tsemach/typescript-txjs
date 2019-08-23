
import createLogger from 'logging'; 
const logger = createLogger('SinglePoint-Test');

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';

import { TxSinglePointRegistry } from '../../src/tx-singlepoint-registry';
import { TxMountPoint } from './../../src/tx-mountpoint';
import { TxTask } from '../../src/tx-task';
import { TxJob } from '../../src/tx-job';

describe('Single Point Class', () => {

  TxSinglePointRegistry.instance.del('GITHUB::GIST::C1');
  TxSinglePointRegistry.instance.del('GITHUB::GIST::C2');
  TxSinglePointRegistry.instance.del('GITHUB::GIST::C3');

  it('tx-singlepoint.spec: simple subscribe tasks test', (done) => {
    logger.info('tx-singlepoint.spec: simple subscribe tasks test')

    TxSinglePointRegistry.instance.del('GITHUB::GIST::C1');
    let singlepoint = TxSinglePointRegistry.instance.create('GITHUB::GIST::C1');

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

  it('tx-singlepoint.spec: simple subscribe tasks test with TxMountPoint type', (done) => {
    logger.info('tx-singlepoint.spec: simple subscribe tasks test')

    TxSinglePointRegistry.instance.del('GITHUB::GIST::C2');
    let singlepoint = TxSinglePointRegistry.instance.create<TxMountPoint>('GITHUB::GIST::C2');

    singlepoint.tasks().subscribe(
      (task: TxTask<any>, mountpoint: TxMountPoint) => {
        logger.info('[GITHUB::GIST::C2:tasks] got task = ' + JSON.stringify(task, undefined, 2));

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
    singlepoint.tasks().next(new TxTask({name: 'simple', type: 'test'}, {from: 'tsemach, more data here'}), singlepoint)

  });

  it('tx-singlepoint.spec: singlepoint with reply subscribe tasks test', (done) => {
    logger.info('tx-singlepoint.spec: singlepoint with reply subscribe tasks test')
    
    TxSinglePointRegistry.instance.del('GITHUB::RECVER_1');
    TxSinglePointRegistry.instance.del('GITHUB::SENDER_1');

    let recver = TxSinglePointRegistry.instance.create('GITHUB::RECVER_1');
    let sender = TxSinglePointRegistry.instance.create('GITHUB::SENDER_1');

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
        logger.info('[GITHUB::SENDER] got task = ' + JSON.stringify(task.get(), undefined, 2));

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
      sender.tasks()
      )      
    )

  });

  it('tx-singlepoint.spec: multiple reciever listen on differnet singlepoints test', (done) => {
    logger.info('tx-singlepoint.spec: multiple singlepoints listen on differnet singlepoints test')

    TxSinglePointRegistry.instance.del('GITHUB::RECVER_3');
    TxSinglePointRegistry.instance.del('GITHUB::SEND-1');
    TxSinglePointRegistry.instance.del('GITHUB::SEND-2');    

    let recver = TxSinglePointRegistry.instance.create('GITHUB::RECVER_3');
    let send_1 = TxSinglePointRegistry.instance.create('GITHUB::SEND-1');
    let send_2 = TxSinglePointRegistry.instance.create('GITHUB::SEND-2');    

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

    recver.tasks().next(new TxTask(send_1_task.head, send_1_task.data, send_1.tasks()));
    recver.tasks().next(new TxTask(send_2_task.head, send_2_task.data, send_2.tasks()));

  });

});