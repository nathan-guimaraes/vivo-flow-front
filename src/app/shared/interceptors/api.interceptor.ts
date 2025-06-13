import { Injectable, inject } from '@angular/core';
import {
  HttpInterceptor,
  HttpHandler,
  HttpEvent,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
  HttpStatusCode,
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, mergeMap } from 'rxjs/operators';
import { AppConfigService } from '../services/app-config.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { RxFileReader } from 'rxjs-filereader';
import {
  HTTP_SHOW_ERROR,
  HTTP_SHOW_LOADING,
} from '../constants/http.constants';
import { GLOBAL_LOADING } from '../constants/loading-controller.constant';
import { onSubscribe } from '@rxjs-lifecycle/core';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(
    private appConfig: AppConfigService,
    private toastService: ToastService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const shouldShowError = req.context.get(HTTP_SHOW_ERROR);
    const shouldShowLoading = req.context.get(HTTP_SHOW_LOADING);

    let observable: Observable<HttpRequest<any>>;

    const url = this.handleUrl(req.url);

    const authService = inject(AuthService);
    const loading = inject(GLOBAL_LOADING);

    if (this.appConfig.isApiUrl(url)) {
      observable = authService.getAuthInfo().pipe(
        map((authInfo) => {
          if (authInfo?.isAuthenticated()) {
            req = req.clone({
              url,
              setHeaders: {
                Authorization: `Bearer ${authInfo.accessToken}`,
              },
            });
          } else {
            req = req.clone({
              url,
            });
          }

          return req;
        })
      );
    } else {
      observable = of(req);
    }

    const showError = (msg: string) => {
      if (shouldShowError) {
        this.toastService.error(msg);
      }
    };

    return observable.pipe(
      mergeMap((req) => {
        return next.handle(req);
      }),
      catchError((response) => {
        if (response instanceof HttpErrorResponse) {
          switch (response.status) {
            case 0:
              showError('defaults.errors.cannotAccessServer');
              response = false;
              break;
            case HttpStatusCode.Forbidden:
              showError('defaults.errors.forbidden');
              response = false;
              break;
            case HttpStatusCode.Unauthorized:
              showError('defaults.errors.notAuthenticated');
              authService.signOut();

              response = false;
              break;
            default:
              let error = response.error;
              if (error) {
                let errorObservable: Observable<any>;

                if (error instanceof Blob) {
                  errorObservable = RxFileReader.readAsText(error).pipe(
                    map((text) => {
                      if (error.type === 'text/plain') {
                        return text;
                      } else {
                        return JSON.parse(text);
                      }
                    })
                  );
                } else {
                  errorObservable = of(error);
                }

                return errorObservable.pipe(
                  mergeMap((error) => {
                    if (typeof error === 'string') {
                      response = new HttpErrorResponse({
                        ...response,
                        error: {
                          messages: [error],
                        },
                      });
                    } else {
                      let auxList: string[];
                      Object.defineProperty(error, 'messages', {
                        get: () => {
                          if (!auxList) {
                            if (error.errors) {
                              auxList = Object.values(
                                error.errors
                              ).flat() as any;
                            } else {
                              auxList = [];
                            }
                          }

                          return auxList;
                        },
                      });

                      response = new HttpErrorResponse({
                        ...response,
                        error,
                      });
                    }

                    return throwError(response);
                  })
                );
              }
              break;
          }
        }

        return throwError(response);
      }),
      onSubscribe(() => {
        if (shouldShowLoading) {
          loading.show();
        }
      }),
      finalize(() => {
        if (shouldShowLoading) {
          loading.hide();
        }
      })
    );
  }

  handleUrl(url: string) {
    return this.appConfig.normalizeUrl(url);
  }
}
