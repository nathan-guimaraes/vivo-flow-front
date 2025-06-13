export interface SubjectModelLike {
  id: number;
  name: string;
  subislandId: number;
}

export class SubjectModel implements SubjectModelLike {
  id: number;
  name: string;
  subislandId: number;

  constructor(item?: Partial<SubjectModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.subislandId = item?.subislandId;
  }
}

export interface SubjectDetailsModelLike extends SubjectModelLike {
  active: boolean;
  subisland: string;
  islandId: number;
  island: string;
  towerId: number;
  tower: string;
}

export class SubjectDetailsModel
  extends SubjectModel
  implements SubjectDetailsModelLike
{
  active: boolean;
  subisland: string;
  islandId: number;
  island: string;
  towerId: number;
  tower: string;

  constructor(item?: Partial<SubjectDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
    this.subisland = item?.subisland;
    this.islandId = item?.islandId;
    this.island = item?.island;
    this.towerId = item?.towerId;
    this.tower = item?.tower;
  }
}
