export interface IslandModelLike {
  id: number;
  name: string;
  towerId: number;
}

export class IslandModel implements IslandModelLike {
  id: number;
  name: string;
  towerId: number;

  constructor(item?: Partial<IslandModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.towerId = item?.towerId;
  }
}

export interface IslandDetailsModelLike extends IslandModelLike {
  active: boolean;
  tower: string;
}

export class IslandDetailsModel
  extends IslandModel
  implements IslandDetailsModelLike
{
  active: boolean;
  tower: string;

  constructor(item?: Partial<IslandDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
    this.tower = item?.tower;
  }
}
