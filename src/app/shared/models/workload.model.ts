export interface WorkloadModelLike {
  id: number;
  name: string;
}

export class WorkloadModel implements WorkloadModelLike {
  id: number;
  name: string;

  constructor(item?: Partial<WorkloadModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
  }
}

export interface WorkloadDetailsModelLike extends WorkloadModelLike {
  active: boolean;
}

export class WorkloadDetailsModel
  extends WorkloadModel
  implements WorkloadDetailsModelLike
{
  active: boolean;

  constructor(item?: Partial<WorkloadDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
  }
}
