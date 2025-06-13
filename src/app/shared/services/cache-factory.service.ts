import { Observable, of, Subject, Subscription } from 'rxjs';
import { OnDestroy } from '@angular/core';
import { Injectable } from '@angular/core';
import {
  tap,
  shareReplay,
  finalize,
  debounceTime,
  first,
  take,
} from 'rxjs/operators';

interface ICacheOnDisposeListener {
  (cacheService: ICacheService): void;
}

export interface CacheRequest<I = any, O = I> {
  path: string;
  source: (path: string) => Observable<I>;
  intercept?: (observable: Observable<I>) => Observable<O>;
  saveToStorage?: boolean;
  removeCacheOnComplete?: boolean;
  keepStreamOpen?: boolean;
  lifetimeSeconds?: number;
  nonce?: any;
}

export interface ICacheService {
  readonly key: string;
  getCached<T = any>(cacheRequest: CacheRequest<T>): Observable<T>;
  removeCache(...paths: string[]);
  removeCacheByStartsWith(...paths: string[]);
  clear(): void;
  dispose(): void;
}

interface CacheItem {
  observable: Observable<any>;
  expiresSubscription: Subscription;
  nonce: string;
}

class CacheService implements ICacheService {
  cacheMap = new Map<string, CacheItem>();

  private _onDisposeListener: ICacheOnDisposeListener;

  constructor(public readonly key: string, private storage?: Storage) {}

  getCached<T = any>(cacheRequest: CacheRequest<T>): Observable<T> {
    return new Observable<T>((subscriber) => {
      const path = cacheRequest.path;
      const storageKey = this.key + '.' + path;

      let cacheItem: CacheItem;

      let nonce = cacheRequest.nonce;
      if (nonce !== undefined) {
        nonce = btoa(JSON.stringify(nonce));
      }

      if (this.cacheMap.has(path)) {
        cacheItem = this.cacheMap.get(path)!;
        if (nonce !== undefined && cacheItem.nonce !== nonce) {
          cacheItem = undefined!;
        }
      }

      let observable: Observable<T>;
      if (cacheItem!) {
        observable = cacheItem.observable!;
      } else {
        if (this.storage && this.storage.getItem(storageKey)) {
          let aux: any = this.storage.getItem(storageKey);
          if (aux) {
            aux = JSON.parse(aux);
          }
          observable = of(aux);
          if (cacheRequest.intercept) {
            observable = cacheRequest.intercept(observable);
          }
        } else {
          observable = cacheRequest.source(path);
          if (cacheRequest.intercept) {
            observable = cacheRequest.intercept(observable);
          }

          const saveToStorage =
            typeof cacheRequest.saveToStorage === 'boolean'
              ? cacheRequest.saveToStorage
              : false;

          if (saveToStorage && this.storage) {
            observable = observable.pipe(
              tap((x) => {
                if (this.storage) {
                  let aux: any = x;
                  if (typeof aux === 'object') {
                    aux = JSON.stringify(aux);
                  }
                  this.storage.setItem(storageKey, aux);
                }
              })
            );
          }
        }

        const removeCacheOnComplete =
          typeof cacheRequest.removeCacheOnComplete === 'boolean'
            ? cacheRequest.removeCacheOnComplete
            : false;

        const keepStreamOpen = !!cacheRequest.keepStreamOpen;

        const lifetime =
          Math.floor(cacheRequest.lifetimeSeconds ?? 60 * 60) * 1000;

        const expiresSubscription = new Subscription();
        const expiresSubject = new Subject<void>();
        const expiresObservable =
          lifetime <= 0
            ? null
            : expiresSubject.pipe(
                debounceTime(lifetime),
                take(1),
                tap(() => {
                  this.cacheMap.delete(path);
                  expiresSubscription.unsubscribe();
                })
              );
        let expiresSubscriptionInternal: Subscription;
        expiresSubscription.add(() => {
          expiresSubject.complete();
          expiresSubscriptionInternal?.unsubscribe();
        });

        if (!keepStreamOpen) {
          observable = observable.pipe(take(1));
        }

        observable = observable.pipe(
          tap({
            next: (res) => {
              expiresSubscriptionInternal?.unsubscribe();
              expiresSubscriptionInternal = expiresObservable?.subscribe();
              expiresSubject.next();

              if (!removeCacheOnComplete && !keepStreamOpen) {
                const aux = this.cacheMap.get(path);
                if (aux) {
                  aux.observable = of(res);
                }
              }
            },
            error: (err) => {
              this.cacheMap.delete(path);
              expiresSubscription.unsubscribe();
              if (this.storage) {
                this.storage.removeItem(storageKey);
              }
            },
          })
        );

        if (removeCacheOnComplete) {
          observable = observable.pipe(
            finalize(() => {
              this.cacheMap.delete(path);
              expiresSubscription.unsubscribe();
            })
          );
        }

        observable = observable.pipe(
          shareReplay({
            bufferSize: 1,
            refCount: true,
          })
        );

        this.cacheMap.set(path, {
          observable,
          expiresSubscription,
          nonce,
        });
      }
      return observable.subscribe(subscriber);
    });
  }

  removeCache(...paths: string[]) {
    for (const path of paths) {
      if (this.cacheMap.has(path)) {
        const aux = this.cacheMap.get(path);
        aux?.expiresSubscription?.unsubscribe();
        this.cacheMap.delete(path);
      }

      if (this.storage) {
        this.storage.removeItem(this.key + '.' + path);
      }
    }
  }

  removeCacheByStartsWith(...paths: string[]) {
    const keysToRemove = new Array<string>();
    for (let key of this.cacheMap.keys()) {
      if (!!paths.find((path) => key.startsWith(path))) {
        keysToRemove.push(key);
      }
    }

    this.removeCache.apply(this, keysToRemove);
  }

  clear() {
    for (const aux of this.cacheMap.values()) {
      aux?.expiresSubscription?.unsubscribe();
    }

    this.cacheMap.clear();
  }

  dispose() {
    this.clear();
    this._onDisposeListener?.(this);
    this._onDisposeListener = null as any;
  }

  setOnDisposeListener(onDisposeListener: ICacheOnDisposeListener) {
    this._onDisposeListener = onDisposeListener;
  }
}

@Injectable()
export class CacheFactoryService implements OnDestroy {
  private instances = new Map<string, CacheService>();

  private _onDisposeListener: ICacheOnDisposeListener = ((
    thisRef: WeakRef<CacheFactoryService>
  ) => {
    return (cacheService) => {
      const factoryAux = thisRef.deref();
      if (factoryAux?.instances?.has(cacheService.key)) {
        factoryAux.instances.delete(cacheService.key);
      }
    };
  })(new WeakRef(this));

  getOrCreate(prefix: string, storage?: Storage): ICacheService {
    let aux: CacheService;
    if (this.instances.has(prefix)) {
      aux = this.instances.get(prefix)!;
    } else {
      aux = new CacheService(prefix, storage);
      aux.setOnDisposeListener(this._onDisposeListener);
      this.instances.set(prefix, aux);
    }

    return aux;
  }

  clearAllCaches() {
    for (const aux of this.instances.values()) {
      aux?.clear();
    }
  }

  ngOnDestroy() {
    const instances = Array.from(this.instances.values());
    for (const aux of instances) {
      aux?.dispose();
    }

    this.instances.clear();
  }
}
