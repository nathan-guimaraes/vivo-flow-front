export interface WorkscaleModelLike {
  id: number;
  name: string;
}

export class WorkscaleModel implements WorkscaleModelLike {
  id: number;
  name: string;

  constructor(item?: Partial<WorkscaleModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
  }
}

export interface WorkscaleDetailsModelLike extends WorkscaleModelLike {
  active: boolean;
}

export class WorkscaleDetailsModel
  extends WorkscaleModel
  implements WorkscaleDetailsModelLike
{
  active: boolean;

  constructor(item?: Partial<WorkscaleDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
  }
}
