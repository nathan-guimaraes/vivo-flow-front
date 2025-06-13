export interface LogsReportTypeLike {
  id: number;
  name: string;
}

export class LogsReportTypeModel implements LogsReportTypeLike {
  id: number;
  name: string;

  constructor(item?: Partial<LogsReportTypeLike>) {
    this.id = item?.id;
    this.name = item?.name;
  }
}

export interface LogsReportTypeModelLike extends LogsReportTypeLike {
  active: boolean;
}

export class LogsReportTypeModelDetailsModel
  extends LogsReportTypeModel
  implements LogsReportTypeModelLike
{
  active: boolean;

  constructor(item?: Partial<LogsReportTypeModelLike>) {
    super(item);
    this.active = !!item?.active;
  }
}
