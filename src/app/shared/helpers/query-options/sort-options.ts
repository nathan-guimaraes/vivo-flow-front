import { Sort } from '../datasources/custom-datasource';
import { ISetParamsAdapter } from './base-options';
import { PageOptions, PageOptionsLike } from './page-options';

export interface SortOptionsLike extends PageOptionsLike {
  sort?: Sort[];
}

export class SortOptions<
    T extends SortOptions = SortOptions<any, any>,
    I extends SortOptionsLike = SortOptionsLike
  >
  extends PageOptions<T, I>
  implements SortOptionsLike
{
  sort?: Sort[];

  override reset(options?: Partial<I>): void {
    super.reset(options);
    this.sort = options?.sort;
  }

  override _handleParamsAdapter(paramsAdapter: ISetParamsAdapter) {
    super._handleParamsAdapter(paramsAdapter);

    const sort = this.sort
      ?.filter((x) => x?.selector && x?.direction)
      ?.map((x) => {
        return {
          selector: x.selector,
          desc: x.direction === 'desc',
        };
      });
    if (sort?.length) {
      paramsAdapter.set('sort', sort);
    }
  }
}
