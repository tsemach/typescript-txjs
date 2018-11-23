import { TxMountPoint } from './tx-mountpoint';
import { TxSinglePoint } from "./tx-singlepoint";

export class TxDoublePoint implements TxMountPoint {
  
  sender: TxSinglePoint; // mount point use to send from me to others
  recver: TxSinglePoint; // mount point use to recv from others to me  

  constructor(private _name: string | Symbol, private _suffix = '') {
    let fullname = _name;
    if (_suffix !== '') {
      fullname = _name + ':' + _suffix
    }
    this.recver = new TxSinglePoint(fullname);
  }

  get name() {
    if (typeof this._name === 'string') {
      return this._name;
    }
    return this._name.toString();
  }  

  tasks() {
    return this.sender.tasks();
  }

  reply() {
    console.log("TxDoublePoint:reply() goint to return this.recver.tasks");
    console.log("TxDoublePoint:reply() this.recver.tasks = " + this.recver.name);
    return this.recver.tasks();
  }

  undos() {
    throw new Error("undos is not supoprted on TxDoublePoint!");
  }

}