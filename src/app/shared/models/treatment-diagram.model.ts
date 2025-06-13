export interface TreatmentDiagramItemModelLike {
  id: number;
  protocolId: number;
  subisland: string;
  startedAt: Date;
  endedAt?: Date;
}

export class TreatmentDiagramItemModel
  implements TreatmentDiagramItemModelLike
{
  id: number;
  protocolId: number;
  subisland: string;
  startedAt: Date;
  endedAt?: Date;

  constructor(item?: Partial<TreatmentDiagramItemModelLike>) {
    this.id = item?.id;
    this.protocolId = item?.protocolId;
    this.subisland = item?.subisland;
    this.startedAt = !item?.startedAt ? null : new Date(item?.startedAt);
    this.endedAt = !item?.endedAt ? null : new Date(item?.endedAt);
  }
}
