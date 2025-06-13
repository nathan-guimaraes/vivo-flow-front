export interface ProtocolVolumeInfoLike {
  date: Date;
  pendingCount: number;
  inTreatmentCount: number;
  pausedCount: number;
  canceledCount: number;
  concludeCount: number;
  inTransferCount: number;
  transferErrorCount: number;
  standByCount: number;
}

export class ProtocolVolumeInfo implements ProtocolVolumeInfoLike {
  date: Date;
  pendingCount: number;
  inTreatmentCount: number;
  pausedCount: number;
  canceledCount: number;
  concludeCount: number;
  inTransferCount: number;
  transferErrorCount: number;
  standByCount: number;

  constructor(item?: Partial<ProtocolVolumeInfoLike>) {
    this.date = !item?.date ? null : new Date(item.date);
    this.pendingCount = item?.pendingCount;
    this.inTreatmentCount = item?.inTreatmentCount;
    this.pausedCount = item?.pausedCount;
    this.canceledCount = item?.canceledCount;
    this.concludeCount = item?.concludeCount;
    this.inTransferCount = item?.inTransferCount;
    this.transferErrorCount = item?.transferErrorCount;
    this.standByCount = item?.standByCount;
  }
}
