
//import logger = require('logging');
import createLogger from 'logging';
const logger = createLogger('Registry-Test');
import * as short from 'short-uuid';
const translator = short();

import 'mocha';
import { expect } from 'chai';
import { assert } from 'chai';
import { TxJobRegistry } from '../../src/tx-job-resgitry';
import { TxJob } from '../../src';
import { TxJobPersistAdapter } from "../../src/tx-job-persist-adapter";
import { TxJobJSON } from "../../src/tx-job-json";
import { C1Component } from "../job/C1.component";
import {C3Component} from "../job/C3.component";
import {TxMountPointRegistry} from "../../src/tx-mountpoint-registry";
import {C2Component} from "../job/C2.component";
import {TxTask} from "../../src/tx-task";

describe('Job Registry Classes - TxJobRegistry', () => {

  before(function() {
    translator.new();
  });
  
  it('check TxJobRegistry - simple get', () => {
    let src = new TxJob('job-1');

    logger.info('src.uuid: \'' + src.uuid + '\'');
    logger.info('going to get job: \'' + src.toJSON().uuid + '\'');
    let dst = TxJobRegistry.instance.get(src.toJSON().uuid);

    expect(dst.getName()).to.equal('job-1');
  });

  it('check TxJobRegistry - persistently', async () => {
    new C1Component();
    new C2Component();
    new C3Component();

    // a persist driver stub (emulate some persist storage)
    class Persist implements TxJobPersistAdapter {
      jobs = new Map<string, TxJobJSON>();

      read(uuid: string): TxJobJSON {
        console.log('[Persist:read] uuid = ' + uuid);

        return this.jobs.get(uuid);
      }

      save(uuid: string, json: TxJobJSON, name?: string): boolean {
        console.log("going to save: name = " + name);
        console.log("going to save: data = " + JSON.stringify(json));

        this.jobs.set(uuid, json);

        return true;
      }
    }

    // set job registry with persist capabilities
    TxJobRegistry.instance.driver = new Persist();

    let src = new TxJob('job-1');

    src.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C1'));
    src.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C2'));
    src.add(TxMountPointRegistry.instance.get('GITHUB::GIST::C3'));

    assert(await TxJobRegistry.instance.persist(src));

    let dst = await TxJobRegistry.instance.rebuild(src.getUuid());
    logger.info("src.toJSON() = " + JSON.stringify(src.toJSON(), undefined, 2));
    logger.info("dst.toJSON() = " + JSON.stringify(dst.toJSON(), undefined, 2));

    assert.deepEqual(src.toJSON(), dst.toJSON());
  });

});
