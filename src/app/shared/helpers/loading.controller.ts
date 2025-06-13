import { BehaviorSubject, Observable, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  shareReplay,
} from 'rxjs/operators';

export class LoadingController {
  private _loadingCount = 0;

  private loadingSubject: Subject<boolean>;

  readonly changes: Observable<boolean>;

  constructor(
    initialLoading?: boolean,
    private limitCount = Number.MAX_SAFE_INTEGER
  ) {
    if (initialLoading) {
      this._loadingCount = 1;
    }

    this.loadingSubject = new BehaviorSubject(this.isShown());
    this.changes = this.loadingSubject.pipe(
      distinctUntilChanged(),
      debounceTime(0),
      shareReplay({
        bufferSize: 1,
        refCount: true,
      })
    );
  }

  isShown() {
    return this._loadingCount > 0;
  }

  show() {
    if (this._loadingCount < this.limitCount) {
      ++this._loadingCount;
    }
    this.loadingSubject.next(this.isShown());
  }

  hide() {
    if (this._loadingCount > 0) {
      --this._loadingCount;
    }
    this.loadingSubject.next(this.isShown());
  }
}
