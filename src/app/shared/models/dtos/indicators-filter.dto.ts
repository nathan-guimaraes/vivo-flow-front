import {
  BaseOptions,
  ISetParamsAdapter,
} from '../../helpers/query-options/base-options';

export enum IndicatorFilterFieldDate {
  CreatedAt = 0,
  EndedAt = 1,
}

export interface IndicatorsFilterDTOLike {
  fieldDate?: IndicatorFilterFieldDate;
  startDate?: Date;
  endDate?: Date;
  segmentId?: number;
  productId?: number;
  negotiationTypeId?: number;
  legacyId?: number;
  supplierId?: number;
  towerId?: number;
}

const fieldDateDefault = IndicatorFilterFieldDate.CreatedAt;

export class IndicatorsFilterDTO
  extends BaseOptions<IndicatorsFilterDTO, IndicatorsFilterDTOLike>
  implements IndicatorsFilterDTOLike
{
  static default() {
    const dtNow = new Date();
    dtNow.setDate(1);
    dtNow.setHours(0);
    dtNow.setMinutes(0);
    dtNow.setSeconds(0);
    dtNow.setMilliseconds(0);

    const startDate = new Date(dtNow);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setMilliseconds(endDate.getMilliseconds() - 1);

    return new IndicatorsFilterDTO({
      fieldDate: fieldDateDefault,
      startDate,
      endDate,
    });
  }

  fieldDate?: IndicatorFilterFieldDate;
  startDate?: Date;
  endDate?: Date;
  segmentId?: number;
  productId?: number;
  negotiationTypeId?: number;
  legacyId?: number;
  supplierId?: number;
  towerId?: number;

  override reset(options?: Partial<IndicatorsFilterDTOLike>): void {
    this.fieldDate = options?.fieldDate ?? fieldDateDefault;
    this.startDate = !options?.startDate ? null : new Date(options.startDate);
    this.endDate = !options?.endDate ? null : new Date(options.endDate);
    this.segmentId = options?.segmentId;
    this.productId = options?.productId;
    this.negotiationTypeId = options?.negotiationTypeId;
    this.legacyId = options?.legacyId;
    this.supplierId = options?.supplierId;
    this.towerId = options?.towerId;
  }

  protected override _handleParamsAdapter(
    paramsAdapter: ISetParamsAdapter
  ): void {
    paramsAdapter.set('fieldDate', this.fieldDate ?? fieldDateDefault);

    if (this.startDate) {
      paramsAdapter.set('startDate', this.startDate);
    }

    if (this.endDate) {
      paramsAdapter.set('endDate', this.endDate);
    }

    paramsAdapter.set('segmentId', this.segmentId);
    paramsAdapter.set('productId', this.productId);
    paramsAdapter.set('negotiationTypeId', this.negotiationTypeId);
    paramsAdapter.set('legacyId', this.legacyId);
    paramsAdapter.set('supplierId', this.supplierId);
    paramsAdapter.set('towerId', this.towerId);
  }
}
