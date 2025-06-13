export interface DealingSubreason2ModelLike {
  id: number;
  name: string;
  dealingSubreasonId: number;
}

export class DealingSubreason2Model implements DealingSubreason2ModelLike {
  id: number;
  name: string;
  dealingSubreasonId: number;

  constructor(item?: Partial<DealingSubreason2ModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
    this.dealingSubreasonId = item?.dealingSubreasonId;
  }
}

export interface DealingSubreason2DetailsModelLike extends DealingSubreason2ModelLike {
  active: boolean;
  dealingSubreason: string;
  dealingReasonId: number;
  dealingReason: string;
  towerId: number;
  tower: string;
}

export class DealingSubreason2DetailsModel
  extends DealingSubreason2Model
  implements DealingSubreason2DetailsModelLike
{
  active: boolean;
  dealingSubreason: string;
  dealingReasonId: number;
  dealingReason: string;
  towerId: number;
  tower: string;

  constructor(item?: Partial<DealingSubreason2DetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
    this.dealingSubreason = item?.dealingSubreason;
    this.dealingReasonId = item?.dealingReasonId;
    this.dealingReason = item?.dealingReason;
    this.towerId = item?.towerId;
    this.tower = item?.tower;
  }
}
