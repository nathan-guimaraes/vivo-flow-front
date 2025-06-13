


import { ISetParamsAdapter } from '../../helpers/query-options/base-options';
import {
  SortOptions,
  SortOptionsLike,
} from '../../helpers/query-options/sort-options';

export interface LogsReportFilterLike {
  startDate: Date;
  endDate: Date;
  types: number[];
}
export interface LogsReportFilterOptionsDTOLike
  extends SortOptionsLike,
  LogsReportFilterLike {}

export class LogsReportFilterOptionsDTO
  extends SortOptions<LogsReportFilterOptionsDTO, LogsReportFilterOptionsDTOLike>
  implements LogsReportFilterOptionsDTOLike
{
  startDate: Date;
  endDate: Date;
  types: number[];

  override reset(options?: Partial<LogsReportFilterOptionsDTOLike>): void {
    super.reset(options);
    this.startDate = options?.startDate;
    this.endDate = options?.endDate;
    this.types = options?.types;
  }

  override _handleParamsAdapter(paramsAdapter: ISetParamsAdapter) {
    super._handleParamsAdapter(paramsAdapter);

    if (this.startDate) {
      paramsAdapter.set('startDate', this.startDate);
    }

    if (this.endDate) {
      paramsAdapter.set('endDate', this.endDate);
    }

    if (this.types?.length) {
      paramsAdapter.set('types', this.types);
    }
  }
}
