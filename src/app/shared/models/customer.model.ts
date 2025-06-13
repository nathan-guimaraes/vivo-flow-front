export interface CustomerModelLike {
  id: number;
  name: string;
  document: string;
  code: number;
  codeGroup: number;
}

export class CustomerModel implements CustomerModelLike {
  id: number;
  name: string;
  document: string;
  code: number;
  codeGroup: number;

  constructor(item?: Partial<CustomerModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.document = item?.document;
    this.code = item?.code;
    this.codeGroup = item?.codeGroup;
  }
}
