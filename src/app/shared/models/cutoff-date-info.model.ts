export interface CutoffDateInfoLike {
  year: number;
  month: number;
  totalProtocolsUntilCutOff: number;
  completedProtocolsUntilCutOff: number;
  totalMonthProtocols: number;
  backLog: number;
}

export class CutoffDateInfo implements CutoffDateInfoLike {
  year: number;
  month: number;
  totalProtocolsUntilCutOff: number;
  completedProtocolsUntilCutOff: number;
  totalMonthProtocols: number;
  backLog: number;

  constructor(item?: Partial<CutoffDateInfoLike>) {
    this.year = item?.year;
    this.month = item?.month;
    this.totalProtocolsUntilCutOff = item?.totalProtocolsUntilCutOff;
    this.completedProtocolsUntilCutOff = item?.completedProtocolsUntilCutOff;
    this.totalMonthProtocols = item?.totalMonthProtocols;
    this.backLog = item?.backLog;
  }
}
