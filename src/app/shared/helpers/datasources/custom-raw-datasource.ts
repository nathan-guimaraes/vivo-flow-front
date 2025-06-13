import {
  Observable,
  asapScheduler,
  from,
  map,
  observeOn,
  of,
  shareReplay,
  take,
} from 'rxjs';
import {
  CustomDataSource,
  IDataLoadOptions,
  IDataSourceOptions,
} from './custom-datasource';
import orderBy from 'lodash/orderBy';
import { ExtractExpr, ItemExprUtils } from '../../utils/item-expr.utils';
import { PageResults } from '../../models/page-regults.model';

export interface IRawDataSourceOptions<T>
  extends Omit<IDataSourceOptions<T>, 'load'> {
  load: <D extends CustomRawDataSource<T> = CustomRawDataSource<T>>(
    this: D
  ) => Observable<T[]> | Promise<T[]> | T[];
}

export class CustomRawDataSource<T> extends CustomDataSource<T> {
  private _rawDataObservable: Observable<T[]>;

  searchExpr: ExtractExpr<T>;

  constructor(options: IRawDataSourceOptions<T>) {
    super({
      ...options,
      load: function (this: CustomDataSource<T>, o) {
        const self = this as any;

        let observable: Observable<T[]> = self._rawDataObservable;
        if (!observable) {
          observable = resolveObservable(options.load.call(self)).pipe(
            shareReplay({
              bufferSize: 1,
              refCount: true,
            })
          );
          self._rawDataObservable = observable;
        }

        return _handleRawDataOp.call(self, observable, o) as any;
      },
    });
  }

  override dispose(): void {
    super.dispose();
    this.clearRawData();
  }

  clearRawData() {
    this._rawDataObservable = null;
    this.clearCache();
  }
}

function _handleRawDataOp<T>(
  this: CustomRawDataSource<T>,
  observable: Observable<T[]>,
  options: IDataLoadOptions
) {
  if (options.searchText && this.searchExpr) {
    observable = observable.pipe(
      observeOn(asapScheduler),
      map((list) => {
        const text = options.searchText.toUpperCase();
        list = list.filter((x, i) => {
          const aux: string = ItemExprUtils.extractValue(x, i, this.searchExpr);
          return !!aux?.toUpperCase?.()?.includes?.(text);
        });
        return list;
      })
    );
  }

  if (options.sort?.length) {
    observable = observable.pipe(
      observeOn(asapScheduler),
      map((list) => {
        list = orderBy(
          list,
          options.sort.map((x) => x.selector),
          options.sort.map((x) => x.direction || 'asc')
        );

        return list;
      })
    );
  }

  const skip = options.skip;
  const take = options.take >= Number.MAX_SAFE_INTEGER ? null : options.take;
  if (skip || take) {
    return observable.pipe(
      observeOn(asapScheduler),
      map((list) => {
        const res: PageResults<any> = {
          totalCount: list.length,
        };

        if (skip && take) {
          list = list.slice(skip, skip + take);
        } else if (skip) {
          list = list.slice(skip);
        } else if (take) {
          list = list.slice(0, take);
        }

        res.results = list;

        return res;
      })
    );
  }

  return observable;
}

function resolveObservable<T>(
  observable: Observable<T[]> | Promise<T[]> | T[]
) {
  if (observable instanceof Promise) {
    observable = from(observable);
  }

  if (!(observable instanceof Observable)) {
    observable = of(observable);
  }

  return observable;
}
