export interface FlowModelLike {
  id: number;
  fileName: string;
  active: boolean;
  createdBy: string;
  createdAt: Date;
}

export class FlowModel implements FlowModelLike {
  id: number;
  fileName: string;
  createdBy: string;
  createdAt: Date;
  active: boolean;

  constructor(item?: Partial<FlowModelLike>) {
    this.id = item?.id;
    this.fileName = item?.fileName;
    this.active = !!item?.active;
    this.createdBy = item?.createdBy;
    this.createdAt = !item?.createdAt ? null : new Date(item.createdAt);
  }
}
