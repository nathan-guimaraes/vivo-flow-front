export enum ProtocolImportStatus {
  Success = 0,
  Warning = 1,
  Error = 2,
  Processing = 3,
}

export interface ProtocolsFileLogModelLike {
  id: number;
  fileName: string;
  status: ProtocolImportStatus;
  createdBy: string;
  createdAt: Date;
}

export class ProtocolsFileLogModel implements ProtocolsFileLogModelLike {
  id: number;
  fileName: string;
  status: ProtocolImportStatus;
  createdBy: string;
  createdAt: Date;

  constructor(item?: Partial<ProtocolsFileLogModelLike>) {
    this.id = item?.id;
    this.fileName = item?.fileName;
    this.status = item?.status;
    this.createdBy = item?.createdBy;
    this.createdAt = !item?.createdAt ? null : new Date(item.createdAt);
  }
}
