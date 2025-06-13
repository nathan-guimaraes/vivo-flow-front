import { BaseOptions, ISetParamsAdapter } from './base-options';

export interface PageOptionsLike {
  countOnly?: boolean;
  requireTotalCount?: boolean;
  skip?: number;
  take?: number;
  searchText?: string;

  requireTotalCountOptional?: boolean;
  skipOptional?: number;
  takeOptional?: number;
  searchTextOptional?: string;
}

export class PageOptions<
    T extends PageOptions = PageOptions<any, any>,
    I extends PageOptionsLike = PageOptionsLike
  >
  extends BaseOptions<T, I>
  implements PageOptionsLike
{
  countOnly?: boolean;
  requireTotalCount?: boolean;
  skip?: number;
  take?: number;
  searchText?: string;

  requireTotalCountOptional?: boolean;
  skipOptional?: number;
  takeOptional?: number;
  searchTextOptional?: string;

  setRequireTotalCount(requireTotalCount: boolean) {
    this.requireTotalCount = requireTotalCount;
    return this;
  }

  setSkip(skip: number) {
    this.skip = skip;
    return this;
  }

  setTake(take: number) {
    this.take = take;
    return this;
  }

  setRequireTotalCountOptional(requireTotalCountOptional: boolean) {
    this.requireTotalCountOptional = requireTotalCountOptional;
    return this;
  }

  setSkipOptional(skipOptional: number) {
    this.skipOptional = skipOptional;
    return this;
  }

  setTakeOptional(takeOptional: number) {
    this.takeOptional = takeOptional;
    return this;
  }

  getRequireTotalCount() {
    return this.requireTotalCount ?? this.requireTotalCountOptional;
  }

  getSkip() {
    return this.skip ?? this.skipOptional;
  }

  getTake() {
    return this.take ?? this.takeOptional;
  }

  reset(options?: Partial<I>): void {
    this.countOnly = options?.countOnly;
    this.requireTotalCount = options?.requireTotalCount;
    this.skip = options?.skip;
    this.take = options?.take;
    this.searchText = options?.searchText;

    this.requireTotalCountOptional = options?.requireTotalCountOptional;
    this.skipOptional = options?.skipOptional;
    this.takeOptional = options?.takeOptional;
    this.searchTextOptional = options?.searchTextOptional;
  }

  protected _handleParamsAdapter(paramsAdapter: ISetParamsAdapter): void {
    if (typeof this.countOnly === 'boolean') {
      paramsAdapter.set('countOnly', this.countOnly);
    }

    const requireTotalCount = this.getRequireTotalCount();
    if (typeof requireTotalCount === 'boolean') {
      paramsAdapter.set('requireTotalCount', !!requireTotalCount);
    }

    const skip = this.getSkip();
    if (typeof skip === 'number') {
      paramsAdapter.set('skip', skip);
    }

    const take = this.getTake();
    if (typeof take === 'number') {
      paramsAdapter.set('take', take);
    }

    const searchText = this.searchText || this.searchTextOptional;
    if (searchText) {
      paramsAdapter.set('searchText', searchText);
    }
  }
}
