export interface DealingReasonModelLike {
  id: number;
  name: string;
  towerId: number;
}

export class DealingReasonModel implements DealingReasonModelLike {
  id: number;
  name: string;
  towerId: number;

  constructor(item?: Partial<DealingReasonModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.towerId = item?.towerId;
  }
}

export interface DealingReasonDetailsModelLike extends DealingReasonModelLike {
  active: boolean;
  tower: string;
}

export class DealingReasonDetailsModel
  extends DealingReasonModel
  implements DealingReasonDetailsModelLike
{
  active: boolean;
  tower: string;

  constructor(item?: Partial<DealingReasonDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
    this.tower = item?.tower;
  }
}
