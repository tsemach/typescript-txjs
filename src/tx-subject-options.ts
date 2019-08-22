
export interface TxSubjectOptions {  
  goto?: string;
}

const defaultSubjectOptions: TxSubjectOptions = {
  goto: null,   // select a mountpoint from a selected group (multipoint)  
} as TxSubjectOptions;

export { defaultSubjectOptions }; 