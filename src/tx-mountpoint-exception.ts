
export class TxMountPointNotFoundException extends ReferenceError {
  constructor(messaged: string) {
    super(messaged);
    this.name = this.constructor.name;
  }
}
