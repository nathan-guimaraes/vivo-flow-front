export interface DealingSubreasonModelLike {
  id: number;
  name: string;
  dealingReasonId: number;
  towerId: number;
  tower: string;
}

export class DealingSubreasonModel implements DealingSubreasonModelLike {
  id: number;
  name: string;
  dealingReasonId: number;
  towerId: number;
  tower: string;

  constructor(item?: Partial<DealingSubreasonModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.dealingReasonId = item?.dealingReasonId;
    this.towerId = item?.towerId;
    this.tower = item?.tower;
  }
}

export interface DealingSubreasonDetailsModelLike extends DealingSubreasonModelLike {
  active: boolean;
  dealingReason: string;
}

export class DealingSubreasonDetailsModel
  extends DealingSubreasonModel
  implements DealingSubreasonDetailsModelLike
{
  active: boolean;
  dealingReason: string;

  constructor(item?: Partial<DealingSubreasonDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
    this.dealingReason = item?.dealingReason;
  }
}
