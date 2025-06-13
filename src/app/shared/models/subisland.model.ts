export interface SubislandModelLike {
  id: number;
  name: string;
  islandId: number;
}

export class SubislandModel implements SubislandModelLike {
  id: number;
  name: string;
  islandId: number;

  constructor(item?: Partial<SubislandModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.islandId = item?.islandId;
  }
}

export interface SubislandDetailsModelLike extends SubislandModelLike {
  active: boolean;
  island: string;
  towerId: number;
  tower: string;
}

export class SubislandDetailsModel
  extends SubislandModel
  implements SubislandDetailsModelLike
{
  active: boolean;
  island: string;
  towerId: number;
  tower: string;

  constructor(item?: Partial<SubislandDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
    this.island = item?.island;
    this.towerId = item?.towerId;
    this.tower = item?.tower;
  }
}
