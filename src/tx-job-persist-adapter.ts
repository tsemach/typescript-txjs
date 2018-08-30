import {TxJobJSON} from "./tx-job-json";

export interface TxJobPersistAdapter {
  save(uuid: string, data: {}, name?: string): boolean;
  read(uuid: string): {}
}

class Persist implements TxJobPersistAdapter {
  read(uuid: string): TxJobJSON {
    return {
      name: 'job',
      stack: '1: \'C1\', 2: \'C2',
      uuid: '1234',
      block: '1: \'C1\', 2: \'C2',
      trace: '1: \'C1\', 2: \'C2',
      single: false,
      revert: false,
      current: 'C1'
    };
  }

  save(uuid: string, json: TxJobJSON, name?: string): boolean {
    console.log("going to save: name = " + name);
    console.log("going to save: data = " + JSON.stringify(json));

    return true;
  }

}

let p = new Persist();

p.save('tsemach', 'stam', 'job-name');
console.log(p.read('1234'));
