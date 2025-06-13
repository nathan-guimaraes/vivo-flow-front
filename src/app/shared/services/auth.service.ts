import { HttpClient, HttpContext } from '@angular/common/http';
import { Inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import {
  concat,
  merge,
  Observable,
  shareReplay,
  distinctUntilChanged,
  mergeMap,
  first,
  map,
  timer,
  Subscription,
  finalize,
  Subject,
  filter,
  EMPTY,
  firstValueFrom,
  debounceTime,
  asapScheduler,
  takeUntil,
  repeat,
  startWith,
  mergeWith,
  switchMap,
  of,
  take,
  defaultIfEmpty,
} from 'rxjs';
import { AuthInfoLike, AuthInfoModel } from '../models/auth.model';
import { IRxStorage } from '@rxjs-storage/core/dist/types/internal/interfaces';
import jwt_decode from 'jwt-decode';
import { AUTH_STORAGE, rolesMap } from '../constants/auth.constant';
import { RxBroadcastChannel } from '@rxjs-toolkit/broadcast-channel';
import { UserProfile } from '../models/user.model';
import {
  HTTP_SHOW_ERROR,
  HTTP_SHOW_LOADING,
} from '../constants/http.constants';
import { onSubscribe } from '@rxjs-lifecycle/core';

const authInfoKey = 'authInfo';

enum SignEventType {
  SignInStart,
  SignInEnd,
  SignOutStart,
  SignOutEnd,
}

type ActionRoles = { [key: string]: string | ActionRoles };

@Injectable()
export class AuthService implements OnDestroy {
  private _authInfoObservable: Observable<AuthInfoModel>;

  private _authenticatedObservable: Observable<boolean>;

  private _signEventsSubject = new Subject<SignEventType>();
  private _broadcastChannel = new RxBroadcastChannel(authInfoKey);

  readonly signEvents = merge(
    this._signEventsSubject,
    this._broadcastChannel.events.pipe(map((x) => x.data as SignEventType))
  ).pipe(distinctUntilChanged());

  constructor(
    private http: HttpClient,
    @Inject(AUTH_STORAGE) private storage: IRxStorage
  ) {}

  ngOnDestroy(): void {
    this._broadcastChannel?.dispose();
  }

  signInByCode(code: string) {
    return this.http
      .post<any>(`~api/Auth/signinByCode`, { code })
      .pipe(this.doLocalLoginOperator());
  }

  signInByLogin(login: string) {
    return this.http
      .post<any>(`~api/Auth/signinByLogin`, { code: login })
      .pipe(this.doLocalLoginOperator());
  }

  signOut() {
    this.getAuthInfo().subscribe(async (authInfo) => {
      if (authInfo) {
        let signOutPromise: Promise<any>;
        if (authInfo.isAuthenticated()) {
          signOutPromise = firstValueFrom(
            this.http.post<any>(`~api/Auth/signOut`, null, {
              context: new HttpContext()
                .set(HTTP_SHOW_ERROR, false)
                .set(HTTP_SHOW_LOADING, true),
            })
          );
        }

        this._signEventsSubject.next(SignEventType.SignOutStart);
        this._broadcastChannel.postMessage(SignEventType.SignOutStart);

        this.storage.removeItem(authInfoKey);

        try {
          await signOutPromise;
        } finally {
          this._signEventsSubject.next(SignEventType.SignOutEnd);
          this._broadcastChannel.postMessage(SignEventType.SignOutEnd);
        }
      }
    });
  }

  hasPermission(action: string): Observable<boolean>;
  hasPermission(action: ActionRoles): Observable<boolean>;
  hasPermission(action: string | ActionRoles): Observable<boolean> {
    return this.getAuthInfo().pipe(
      map((x) => x?.profileId),
      map((profileId) => {
        return this.hasPermissionByProfile(profileId, action);
      }),
      shareReplay({
        refCount: true,
        bufferSize: 1,
      })
    );
  }

  hasPermissionByProfile(profileId: UserProfile, action: string | ActionRoles) {
    let actions: string[];
    if (typeof action === 'object') {
      const recursiveFn = (act: ActionRoles) => {
        let subActions = Object.values(act);
        return subActions.flatMap((subAction) => {
          if (typeof subAction === 'string') {
            return [subAction];
          } else {
            return recursiveFn(subAction);
          }
        });
      };

      actions = recursiveFn(action);
    } else {
      actions = [action];
    }

    const roles = rolesMap.get(profileId);
    return actions.some((x) => {
      return roles.includes(x);
    });
  }

  getToken() {
    return this.getAuthInfo().pipe(map((x) => x?.accessToken));
  }

  getAuthInfo(): Observable<AuthInfoModel> {
    return this.observeAuthInfo().pipe(first());
  }

  isAuthenticated() {
    return this.observeAuthenticated().pipe(first());
  }

  observeAuthenticated(): Observable<boolean> {
    if (!this._authenticatedObservable) {
      const isAuthenticatedFn = (authInfo: AuthInfoModel) => {
        return authInfo?.isAuthenticated() ?? false;
      };

      const observable = new Observable<boolean>((subscriber) => {
        let subscription: Subscription;

        subscriber.add(() => {
          subscription?.unsubscribe();
        });
        subscriber.add(
          this.observeAuthInfo().subscribe((authInfo) => {
            subscription?.unsubscribe();

            const authenticated = isAuthenticatedFn(authInfo);
            if (authenticated) {
              const delay = authInfo.expires!.getTime() - Date.now();

              const aux = Math.max(delay - 5000, 0);
              subscription = timer(aux, 1000).subscribe(() => {
                if (!isAuthenticatedFn(authInfo)) {
                  subscription?.unsubscribe();
                  this.signOut();
                }
              });
            }

            subscriber.next(authenticated);
          })
        );
      });

      this._authenticatedObservable = observable.pipe(
        distinctUntilChanged(),
        shareReplay({
          bufferSize: 1,
          refCount: true,
        })
      );
    }

    return this._authenticatedObservable;
  }

  observeAuthInfo(): Observable<AuthInfoModel> {
    if (!this._authInfoObservable) {
      const observable = new Observable<AuthInfoModel>((subscriber) => {
        const authInfoLike: AuthInfoLike = this.storage.getItem(authInfoKey);
        let authInfo = new AuthInfoModel(authInfoLike);

        if (!authInfo?.isAuthenticated()) {
          authInfo = null;
        }

        subscriber.next(authInfo);
        subscriber.complete();
      });

      const { signEvents } = this;

      const signEventsObservable = signEvents.pipe(
        startWith(null),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        })
      );

      this._authInfoObservable = merge(
        this.storage.onItemChanged(authInfoKey),
        this.storage.onItemRemoved(authInfoKey),
        signEventsObservable.pipe(
          filter((x) => {
            return x === SignEventType.SignInEnd;
          })
        )
      ).pipe(
        debounceTime(0, asapScheduler),
        startWith(null),
        mergeMap(() => observable),
        mergeWith(
          signEventsObservable.pipe(
            filter((x) => {
              return x === SignEventType.SignOutStart;
            }),
            map(() => null)
          )
        ),
        distinctUntilChanged(),
        mergeWith(
          signEventsObservable.pipe(
            filter((x) => {
              return x === SignEventType.SignOutEnd;
            }),
            map(() => null)
          )
        ),
        shareReplay({
          refCount: true,
          bufferSize: 1,
        }),
        switchMap((value) => {
          if (value) {
            return of(value);
          } else {
            return signEventsObservable.pipe(
              take(1),
              filter((x) => {
                return x !== SignEventType.SignOutStart;
              }),
              map(() => value)
            );
          }
        })
      );
    }

    return this._authInfoObservable;
  }

  private doLocalLoginOperator() {
    return (source: Observable<any>) => {
      return source.pipe(
        onSubscribe(() => {
          this._signEventsSubject.next(SignEventType.SignInStart);
          this._broadcastChannel.postMessage(SignEventType.SignInStart);
        }),
        map<any, AuthInfoModel>((res) => {
          const tokenType = res.type;
          const accessToken = res.accessToken;
          const jwtDecoded = jwt_decode<any>(accessToken);

          const authInfo = new AuthInfoModel({
            ...jwtDecoded,
            profileId: Number(jwtDecoded.role),
            tokenType,
            accessToken,
            expires: new Date(jwtDecoded.exp * 1000),
          });
          this.storage.setItem(authInfoKey, authInfo);

          this._signEventsSubject.next(SignEventType.SignInEnd);
          this._broadcastChannel.postMessage(SignEventType.SignInEnd);

          return authInfo;
        })
      );
    };
  }
}
