export interface ProtocolStatusModelLike {
  id: number;
  name: string;
}

export class ProtocolStatusModel implements ProtocolStatusModelLike {
  id: number;
  name: string;

  constructor(item?: Partial<ProtocolStatusModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
  }
}
