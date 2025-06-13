export interface TowerModelLike {
  id: number;
  name: string;
}

export class TowerModel implements TowerModelLike {
  id: number;
  name: string;

  constructor(item?: Partial<TowerModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
  }
}

export interface TowerDetailsModelLike extends TowerModelLike {
  active: boolean;
}

export class TowerDetailsModel
  extends TowerModel
  implements TowerDetailsModelLike
{
  active: boolean;

  constructor(item?: Partial<TowerDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
  }
}
