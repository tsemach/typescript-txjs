export interface TxJobPresistAdapter {
  save(uuid: string, data: {}, name?: string): boolean;
  read(uuid: string): {}
}

class Presist implements TxJobPresistAdapter {
  read(uuid: string): {} {
    return {name: 'job', stack: {1: 'C1', 2: 'C2'}};
  }

  save(uuid: string, data: {}, name?: string): boolean {
    console.log("going to save: name = " + name);
    console.log("going to save: data = " + JSON.stringify(data));

    return true;
  }

}

let p = new Presist();

p.save('tsemach', 'stam', 'job-name');
console.log(p.read('1234'));
