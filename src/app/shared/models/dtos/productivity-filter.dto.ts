import { ISetParamsAdapter } from '../../helpers/query-options/base-options';
import {
  SortOptions,
  SortOptionsLike,
} from '../../helpers/query-options/sort-options';

export interface ProductivityFilterLike {
  towers?: number[];
  islands?: number[];
  subislands?: number[];
  subjects?: number[];
  segments?: number[];
  negotiationTypes?: number[];
  products?: number[];
}

export interface ProductivityFilterOptionsDTOLike
  extends SortOptionsLike,
    ProductivityFilterLike {}

export class ProductivityFilterOptionsDTO
  extends SortOptions<
    ProductivityFilterOptionsDTO,
    ProductivityFilterOptionsDTOLike
  >
  implements ProductivityFilterOptionsDTOLike
{
  towers?: number[];
  islands?: number[];
  subislands?: number[];
  subjects?: number[];
  segments?: number[];
  negotiationTypes?: number[];
  products?: number[];

  override reset(options?: Partial<ProductivityFilterOptionsDTOLike>): void {
    super.reset(options);
    this.towers = options?.towers;
    this.islands = options?.islands;
    this.subislands = options?.subislands;
    this.subjects = options?.subjects;
    this.segments = options?.segments;
    this.negotiationTypes = options?.negotiationTypes;
    this.products = options?.products;
  }

  override _handleParamsAdapter(paramsAdapter: ISetParamsAdapter) {
    super._handleParamsAdapter(paramsAdapter);

    if (this.towers?.length) {
      paramsAdapter.set('towers', this.towers);
    }

    if (this.islands?.length) {
      paramsAdapter.set('islands', this.islands);
    }

    if (this.subislands?.length) {
      paramsAdapter.set('subislands', this.subislands);
    }

    if (this.subjects?.length) {
      paramsAdapter.set('subjects', this.subjects);
    }

    if (this.segments?.length) {
      paramsAdapter.set('segments', this.segments);
    }

    if (this.negotiationTypes?.length) {
      paramsAdapter.set('negotiationTypes', this.negotiationTypes);
    }

    if (this.products?.length) {
      paramsAdapter.set('products', this.products);
    }
  }
}
