import { ISetParamsAdapter } from '../../helpers/query-options/base-options';
import {
  SortOptions,
  SortOptionsLike,
} from '../../helpers/query-options/sort-options';
import { UserProfile, UserStatus } from '../user.model';

export interface FlowFilterLike {}

export interface FlowFilterOptionsDTOLike
  extends SortOptionsLike,
    FlowFilterLike {}

export class FlowFilterOptionsDTO
  extends SortOptions<FlowFilterOptionsDTO, FlowFilterOptionsDTOLike>
  implements FlowFilterOptionsDTOLike
{
  override reset(options?: Partial<FlowFilterOptionsDTOLike>): void {
    super.reset(options);
  }

  override _handleParamsAdapter(paramsAdapter: ISetParamsAdapter) {
    super._handleParamsAdapter(paramsAdapter);
  }
}
