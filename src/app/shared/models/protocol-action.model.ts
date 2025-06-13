export interface ProtocolActionModelLike {
  id: number;
  name: string;
}

export class ProtocolActionModel implements ProtocolActionModelLike {
  id: number;
  name: string;

  constructor(item?: Partial<ProtocolActionModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
  }
}

export interface ProtocolActionDetailsModelLike extends ProtocolActionModelLike {
  active: boolean;
}

export class ProtocolActionDetailsModel
  extends ProtocolActionModel
  implements ProtocolActionDetailsModelLike
{
  active: boolean;

  constructor(item?: Partial<ProtocolActionDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
  }
}
