import { ISetParamsAdapter } from '../../helpers/query-options/base-options';
import {
  PageOptions,
  PageOptionsLike,
} from '../../helpers/query-options/page-options';

export interface CustomerFilterOptionsDTOLike extends PageOptionsLike {
  name?: string;
  document?: string;
  code?: string;
  codeGroup?: string;
}

export class CustomerFilterOptionsDTO
  extends PageOptions<CustomerFilterOptionsDTO, CustomerFilterOptionsDTOLike>
  implements CustomerFilterOptionsDTOLike
{
  name?: string;
  document?: string;
  code?: string;
  codeGroup?: string;

  override reset(options?: Partial<CustomerFilterOptionsDTOLike>): void {
    super.reset(options);
    this.name = options?.name;
    this.document = options?.document;
    this.code = options?.code;
    this.codeGroup = options?.codeGroup;
  }

  override _handleParamsAdapter(paramsAdapter: ISetParamsAdapter) {
    super._handleParamsAdapter(paramsAdapter);

    if (this.name) {
      paramsAdapter.set('name', this.name);
    }

    if (this.document) {
      paramsAdapter.set('document', this.document);
    }

    if (this.code) {
      paramsAdapter.set('code', this.code);
    }

    if (this.codeGroup) {
      paramsAdapter.set('codeGroup', this.codeGroup);
    }
  }
}
