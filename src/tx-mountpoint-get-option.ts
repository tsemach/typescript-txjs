
export enum TxMountPointGetOptionsEnum {
  PUBLIC,
  SENDER
}

export interface TxMountPointGetOptions {
  reply: TxMountPointGetOptionsEnum;
}

export const defaultMountPointGetOptions: TxMountPointGetOptions = {
  reply: TxMountPointGetOptionsEnum.SENDER
}