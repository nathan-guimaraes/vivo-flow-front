import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  BehaviorSubject,
  Observable,
  Subject,
  Subscription,
  asapScheduler,
  defer,
  finalize,
  from,
  observeOn,
  of,
  subscribeOn,
  take,
  takeUntil,
  tap,
  zip,
} from 'rxjs';
import { PageResults } from '../../models/page-regults.model';
import { LoadingController } from '../loading.controller';
import { IDataSource } from './datasource';

export type SortDirection = 'asc' | 'desc' | '';

export interface Sort {
  selector: string;
  direction: SortDirection;
}

export interface IDataLoadOptions {
  skip: number;
  take: number;
  sort?: Sort[];
  searchText?: string;
}

export interface IDataSourceOptions<T> {
  pageIndex?: number;
  pageSize?: number;
  load: <D extends CustomDataSource<T> = CustomDataSource<T>>(
    this: D,
    options: IDataLoadOptions
  ) =>
    | Observable<PageResults<T> | T[]>
    | Promise<PageResults<T> | T[]>
    | PageResults<T>
    | T[];
  loadingController?: LoadingController;
  initialLoad?: boolean;
  useCollectionViewer?: boolean;
  infinityMode?: boolean;
}

export class CustomDataSource<T> extends DataSource<T> implements IDataSource {
  private _fetchedPages = new Set<number>();
  private _cachedData: T[] = [];
  private _itemsSubject = new BehaviorSubject<T[]>([]);

  private _collectionViewerSubscriptionMap = new WeakMap<
    CollectionViewer,
    Subscription
  >();

  infinityMode: boolean;
  requireTotalCount: boolean;
  pageIndex: number;
  pageSize: number;
  searchText: string;
  sort: Sort;

  private _totalCount = -1;
  get totalCount() {
    return this._totalCount;
  }

  get page() {
    return pageIndexToPage(this.pageIndex, this.pageSize);
  }

  set page(value) {
    this.pageIndex = pageToPageIndex(value, this.pageSize);
  }

  private _disposed = false;
  get disposed() {
    return this._disposed;
  }

  private readonly loadingController: LoadingController;

  get loadingChanges() {
    return this.loadingController.changes;
  }

  private _cancelRenderPageListSubject = new Subject<void>();
  private _loadRequestSubject = new Subject<void>();
  private _reloadRequestSubject = new Subject<void>();

  get onReload() {
    return this._reloadRequestSubject.asObservable();
  }

  private _connectionsCount = 0;
  private readonly _subscription = new Subscription();

  constructor(private options: IDataSourceOptions<T>) {
    super();
    this.infinityMode = !!options.infinityMode;
    this.pageIndex = options.pageIndex ?? 0;
    this.pageSize = options.pageSize ?? Number.MAX_SAFE_INTEGER;
    this.loadingController =
      options.loadingController ?? new LoadingController();
  }

  override connect(
    collectionViewer: CollectionViewer
  ): Observable<readonly T[]> {
    if (this.disposed) {
      throw new Error('DataSource has disposed');
    }

    this._setupConnection(collectionViewer);

    return this._itemsSubject.asObservable();
  }

  override disconnect(collectionViewer: CollectionViewer): void {
    if (this._connectionsCount > 0) {
      --this._connectionsCount;

      this._collectionViewerSubscriptionMap
        .get(collectionViewer)
        ?.unsubscribe();

      if (this._connectionsCount === 0) {
        this.cancel();
      }
    }
  }

  dispose() {
    if (!this.disposed) {
      this._disposed = true;
      this._itemsSubject.complete();

      this._cancelRenderPageListSubject.next();
      this._cancelRenderPageListSubject.complete();

      this._subscription?.unsubscribe();

      this.clearCache();
      this.options = null;
    }
  }

  toObservable(collectionViewer?: CollectionViewer) {
    return new Observable<T[]>((subscriber) => {
      const observable = this.connect(collectionViewer);
      subscriber.add(
        observable.subscribe({
          next: (list) => {
            subscriber.next(list as any);
          },
          complete: () => {
            subscriber.complete();
          },
        })
      );

      subscriber.add(() => {
        this.disconnect(collectionViewer);
      });
    });
  }

  isLoading() {
    return this.loadingController.isShown();
  }

  cancel() {
    if (this.disposed) {
      return;
    }

    this._cancelRenderPageListSubject.next();
  }

  load() {
    if (this.disposed) {
      return;
    }

    this._cancelRenderPageListSubject.next();

    this._loadRequestSubject.next();
    this._fetchPages([this.page]);
  }

  reload() {
    this.clearCache();
    this._reloadRequestSubject.next();
    this.load();
  }

  clearCache() {
    this._cachedData.length = 0;
    this._fetchedPages.clear();
  }

  items() {
    return this._cachedData?.slice();
  }

  private _setupConnection(collectionViewer: CollectionViewer) {
    if (this._connectionsCount++ === 0) {
      if ((this.options.initialLoad ?? true) && !this.isLoading()) {
        this._subscription.add(
          of(null)
            .pipe(observeOn(asapScheduler))
            .subscribe(() => {
              this.reload();
            })
        );
      }
    }

    if (this.options.useCollectionViewer) {
      const weakMap = this._collectionViewerSubscriptionMap;

      let auxDisposeFn: () => void;

      const subscription = collectionViewer.viewChange
        .pipe(
          finalize(() => {
            auxDisposeFn();
          })
        )
        .subscribe((range) => {
          const startPage = pageIndexToPage(range.start, this.pageSize);
          const endPage = pageIndexToPage(range.end, this.pageSize);

          let pages: number[] = [];
          for (let i = startPage; i <= endPage; ++i) {
            pages.push(i);
          }

          this._fetchPages(pages, true);
        });

      weakMap.set(collectionViewer, subscription);

      auxDisposeFn = () => {
        subscription.unsubscribe();

        weakMap.delete(collectionViewer);

        auxDisposeFn = null;
      };

      this._subscription.add(() => {
        auxDisposeFn?.();
      });
    }
  }

  private _fetchPages(pages: number[], ignorePagesLoaded = false) {
    const { pageSize } = this;

    pages = pages.filter((x) => !!x);

    const observables = pages
      .map((page) => {
        const pageIndex = pageToPageIndex(page, pageSize);

        let observable: Observable<any>;
        if (this._fetchedPages.has(page)) {
          if (ignorePagesLoaded) {
            return null;
          }

          observable = of(null);
        } else {
          this._fetchedPages.add(page);

          let sort: Sort[];
          if (this.sort?.selector && this.sort.direction) {
            sort = [
              {
                selector: this.sort.selector,
                direction: this.sort.direction,
              },
            ];
          }

          observable = defer(() => {
            return resolveObservable<T>(
              this.options.load.call(this, {
                skip: pageIndex,
                take: pageSize >= Number.MAX_SAFE_INTEGER ? null : pageSize,
                sort,
                searchText: this.searchText,
              })
            );
          }).pipe(
            subscribeOn(asapScheduler),
            observeOn(asapScheduler),
            take(1),
            tap((res) => {
              let results: T[];
              if (Array.isArray(res)) {
                results = res;
                this._totalCount = res.length;
              } else {
                if (res.totalCount > -1) {
                  this._totalCount = res.totalCount;
                }

                results = res.results;
              }

              this._cachedData.length = this._totalCount;
              this._cachedData.splice(pageIndex, pageSize, ...results);
            })
          );
        }

        return observable.pipe(
          observeOn(asapScheduler),
          tap(() => {
            const index = pages.indexOf(page);
            if (index > -1) {
              pages.splice(index, 1);
            }

            let list: T[];
            let start: number;
            let end: number;
            if (!this.infinityMode) {
              start = pageIndex;
              end = Math.min(this._cachedData.length, pageIndex + pageSize);
            } else {
              start = 0;
              end = this._cachedData.length;
            }

            list = this._cachedData.slice(start, end);

            this._itemsSubject.next(list);
          })
        );
      })
      .filter((x) => !!x);

    if (!observables.length) {
      return;
    }

    this.loadingController?.show();
    zip(...observables)
      .pipe(
        finalize(() => {
          this.loadingController?.hide();
        }),
        takeUntil(
          this._cancelRenderPageListSubject.pipe(
            tap(() => {
              for (let page of pages) {
                if (typeof page === 'number') {
                  this._fetchedPages.delete(page);
                }
              }
            })
          )
        )
      )
      .subscribe();
  }
}

function pageToPageIndex(page: number, pageSize: number) {
  return Math.floor((page - 1) * pageSize);
}

function pageIndexToPage(pageIndex: number, pageSize: number) {
  return Math.floor(pageIndex / pageSize + 1);
}

function resolveObservable<T>(
  observable:
    | Observable<T[] | PageResults<T>>
    | Promise<T[] | PageResults<T>>
    | T[]
    | PageResults<T>
) {
  if (observable instanceof Promise) {
    observable = from(observable);
  }

  if (!(observable instanceof Observable)) {
    observable = of(observable);
  }

  return observable;
}
