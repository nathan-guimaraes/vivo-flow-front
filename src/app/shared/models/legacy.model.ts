export interface LegacyModelLike {
  id: number;
  name: string;
}

export class LegacyModel implements LegacyModelLike {
  id: number;
  name: string;

  constructor(item?: Partial<LegacyModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
  }
}

export interface LegacyDetailsModelLike extends LegacyModelLike {
  active: boolean;
}

export class LegacyDetailsModel
  extends LegacyModel
  implements LegacyDetailsModelLike
{
  active: boolean;

  constructor(item?: Partial<LegacyDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
  }
}
