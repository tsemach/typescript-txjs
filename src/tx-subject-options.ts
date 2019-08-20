
export interface TxSubjectOptions {  
  goto?: string;
}

const defaultSubscribeOptions: TxSubjectOptions = {
  goto: null,   // select a mountpoint from a selected group (multipoint)  
} as TxSubjectOptions;

export { defaultSubscribeOptions }; 