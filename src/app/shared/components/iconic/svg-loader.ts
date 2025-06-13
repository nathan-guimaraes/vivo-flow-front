import { SvgLoader } from 'angular-svg-icon';
import { Observable, Subscription, of } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { shareReplay, tap } from 'rxjs/operators';
import { Injectable, makeStateKey, TransferState } from '@angular/core';

export abstract class CustomSvgLoader extends SvgLoader {
  abstract load(url: string): Subscription;
}

@Injectable()
export class SvgBrowserLoader extends CustomSvgLoader {
  private cacheMap = new Map<string, Observable<string>>();

  constructor(private transferState: TransferState) {
    super();
  }

  override getSvg(url: string): Observable<string> {
    const key = makeStateKey<string>('transfer-svg:' + url);
    const data = this.transferState.get(key, null);
    if (data) {
      return of(data);
    } else {
      if (this.cacheMap.has(url)) {
        return this.cacheMap.get(url)!;
      } else {
        const observable = fromFetch(url, {
          selector: (response) => response.text(),
        }).pipe(
          tap((value) => {
            this.transferState.set(key, value);
            this.cacheMap.delete(url);
          }),
          shareReplay({
            bufferSize: 1,
            refCount: true,
          })
        );
        this.cacheMap.set(url, observable);
        return observable;
      }
    }
  }

  override load(url: string): Subscription {
    return this.getSvg(url).subscribe();
  }
}
