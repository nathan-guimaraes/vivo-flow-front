import {
  Observable,
  ReplaySubject,
  Subscription,
  asapScheduler,
  defer,
  finalize,
  from,
  of,
  subscribeOn,
} from 'rxjs';
import { LoadingController } from '../loading.controller';
import { IDataSource } from './datasource';

export class SingleDataSource<T = any, P = any> implements IDataSource {
  private _subject = new ReplaySubject<T>(1);
  readonly changes = this._subject.asObservable();

  private _errorSubject = new ReplaySubject<any>(1);
  readonly errors = this._errorSubject.asObservable();

  private loadingController = new LoadingController();

  get loadingChanges() {
    return this.loadingController.changes;
  }

  private _subscription: Subscription;

  private _disposed = false;
  get disposed() {
    return this._disposed;
  }

  params?: P;

  constructor(
    private _loadFn: (params?: P) => Observable<T> | Promise<T> | T,
    immediateLoad: boolean = true
  ) {
    if (immediateLoad) {
      this.load();
    }
  }

  isLoading(): boolean {
    return this.loadingController.isShown();
  }

  reload() {
    if (this.disposed) {
      return;
    }

    this.load(this.params);
  }

  load(params?: P) {
    if (this.disposed) {
      return;
    }

    this.params = params;
    this._subscription?.unsubscribe();

    this.loadingController.show();
    this._subscription = defer(() => {
      let res = this._loadFn(params);
      if (res instanceof Promise) {
        res = from(res);
      }

      if (!(res instanceof Observable)) {
        res = of(res);
      }

      return res;
    })
      .pipe(
        subscribeOn(asapScheduler),
        finalize(() => {
          this.loadingController.hide();
        })
      )
      .subscribe({
        next: (data) => {
          this._subject.next(data);
        },
        error: (err) => {
          this._errorSubject.next(err);
        },
      });
  }

  cancel(): void {
    this._subscription?.unsubscribe();
  }

  dispose() {
    if (this.disposed) {
      return;
    }

    this._subscription?.unsubscribe();
    this._subject.complete();
    this._loadFn = null;
    this._disposed = true;
  }
}
