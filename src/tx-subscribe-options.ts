
export interface TxSubscribeOptions {  
  goto?: string;
}

const defaultSubscribeOptions: TxSubscribeOptions = {
  goto: null,   // select a mountpoint from a selected group (multipoint)  
} as TxSubscribeOptions;

export { defaultSubscribeOptions };