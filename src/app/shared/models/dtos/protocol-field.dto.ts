import {
  BaseOptions,
  ISetParamsAdapter,
} from '../../helpers/query-options/base-options';

export interface ProtocolFieldChangesDTOLike {
  fieldId: number;
  required?: boolean;
  active?: boolean;
}

export interface ProtocolFieldFilterDTOLike {
  subislandId: number;
  productIds: number[];
  negotiationTypeIds: number[];
  segmentIds: number[];
  legacyIds: number[];
  isManual?: boolean;
}

export class ProtocolFieldFilterDTO
  extends BaseOptions<ProtocolFieldFilterDTO, ProtocolFieldFilterDTOLike>
  implements ProtocolFieldFilterDTOLike
{
  subislandId: number;
  productIds: number[];
  negotiationTypeIds: number[];
  segmentIds: number[];
  legacyIds: number[];
  isManual?: boolean;

  override reset(options?: Partial<ProtocolFieldFilterDTOLike>): void {
    this.subislandId = options?.subislandId;
    this.productIds = options?.productIds;
    this.negotiationTypeIds = options?.negotiationTypeIds;
    this.segmentIds = options?.segmentIds;
    this.legacyIds = options?.legacyIds;
    this.isManual = options?.isManual;
  }

  protected override _handleParamsAdapter(
    paramsAdapter: ISetParamsAdapter
  ): void {
    paramsAdapter.set('subislandId', this.subislandId);
    paramsAdapter.set('productIds', this.productIds);
    paramsAdapter.set('negotiationTypeIds', this.negotiationTypeIds);
    paramsAdapter.set('segmentIds', this.segmentIds);
    paramsAdapter.set('legacyIds', this.legacyIds);
    paramsAdapter.set('isManual', this.isManual);
  }
}
