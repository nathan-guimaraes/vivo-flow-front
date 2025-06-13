export interface SegmentModelLike {
  id: number;
  name: string;
}

export class SegmentModel implements SegmentModelLike {
  id: number;
  name: string;

  constructor(item?: Partial<SegmentModelLike>) {
    this.id = item?.id;
    this.name = item?.name;
  }
}

export interface SegmentDetailsModelLike extends SegmentModelLike {
  active: boolean;
}

export class SegmentDetailsModel
  extends SegmentModel
  implements SegmentDetailsModelLike
{
  active: boolean;

  constructor(item?: Partial<SegmentDetailsModelLike>) {
    super(item);
    this.active = !!item?.active;
  }
}
