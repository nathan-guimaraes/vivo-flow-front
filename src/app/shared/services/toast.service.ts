import { Injectable, Injector, OnDestroy } from '@angular/core';
import merge from 'lodash/merge';
import defaults from 'lodash/defaults';
import {
  animationFrameScheduler,
  asapScheduler,
  asyncScheduler,
  EMPTY,
  from,
  fromEvent,
  Observable,
  of,
  Subject,
  Subscription,
  zip,
} from 'rxjs';
import {
  delay,
  map,
  mergeMap,
  observeOn,
  shareReplay,
  tap,
} from 'rxjs/operators';
import Toast from 'bootstrap/js/dist/toast';
import { TranslateService } from '@ngx-translate/core';

export interface ToastActionOptions {
  id?: string;
  text: string;
  type?: 'primary' | 'secondary';
  onClick?: (toast: IToastInstance) => void;
}

export interface ToastOptions {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message?: string;
  autoDismiss?: boolean;
  autoDismissDuration?: 'fast' | 'medium' | 'slow';
  onDismiss?: () => void;
  buttons?: ToastActionOptions[];
}

export interface IToastInstance {
  onDismiss(): Observable<any>;
  dismiss(): void;
  dismissIn(ms: number): Subscription;
  dismissWhen<T = any>(
    observableOrPromise: Observable<T> | Promise<T>
  ): Subscription;
}

export type ToastInstance = IToastInstance;

type ToastEvent = {
  fn: (container: Element) => void;
  closed: boolean;
};

@Injectable()
export class ToastService implements OnDestroy {
  private toastSubject: Subject<ToastEvent>;
  private toastSubscription: Subscription;

  constructor(private injector: Injector) {
    this.toastSubject = new Subject<ToastEvent>();
    this.toastSubscription = this.toastSubject
      .pipe(
        observeOn(asyncScheduler),
        mergeMap((e) => {
          if (e.closed) {
            return EMPTY;
          }

          return from(getOrCreateContainer()).pipe(
            delay(10),
            observeOn(animationFrameScheduler),
            tap((container) => {
              if (e.closed) {
                return;
              }

              e.fn(container);
            }),
            delay(10)
          );
        }, 1)
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.toastSubscription?.unsubscribe();
  }

  info(message: string): ToastInstance;
  info(title: string, message: string): ToastInstance;
  info(titleOrOptions: string | ToastOptions): ToastInstance;
  info(titleOrOptions: string | ToastOptions, message?: string): ToastInstance {
    return this._toast(
      { type: 'info', title: 'Aviso', autoDismiss: false },
      titleOrOptions,
      message
    );
  }

  success(message: string): ToastInstance;
  success(title: string, message: string): ToastInstance;
  success(titleOrOptions: string | ToastOptions): ToastInstance;
  success(
    titleOrOptions: string | ToastOptions,
    message?: string
  ): ToastInstance {
    return this._toast(
      {
        type: 'success',
        title: 'Sucesso',
      },
      titleOrOptions,
      message
    );
  }

  warning(message: string): ToastInstance;
  warning(title: string, message: string): ToastInstance;
  warning(titleOrOptions: string | ToastOptions): ToastInstance;
  warning(
    titleOrOptions: string | ToastOptions,
    message?: string
  ): ToastInstance {
    return this._toast(
      { type: 'warning', title: 'Alerta' },
      titleOrOptions,
      message
    );
  }

  error(message: string): ToastInstance;
  error(title: string, message: string): ToastInstance;
  error(titleOrOptions: string | ToastOptions): ToastInstance;
  error(
    titleOrOptions: string | ToastOptions,
    message?: string
  ): ToastInstance {
    return this._toast(
      {
        type: 'error',
        title: 'Erro',
        autoDismissDuration: 'slow',
      },
      titleOrOptions,
      message
    );
  }

  toast(options?: ToastOptions): ToastInstance {
    return this._toast(options);
  }

  private _toast(
    defaultOptions?: ToastOptions,
    titleOrOptions?: string | ToastOptions,
    message?: string
  ): ToastInstance {
    defaultOptions = defaultOptions ?? {};
    const type = defaultOptions.type;
    const titleDefault = defaultOptions.title;
    let title =
      typeof titleOrOptions === 'string'
        ? titleOrOptions
        : titleOrOptions?.title ?? titleDefault;
    if (typeof message !== 'string') {
      message =
        typeof titleOrOptions !== 'string'
          ? titleOrOptions?.message ?? title
          : title;
      title = titleDefault;
    }

    if (typeof titleOrOptions === 'string') {
      titleOrOptions = merge({}, defaultOptions, { title, message, type });
    } else {
      titleOrOptions = merge({}, defaultOptions, titleOrOptions, {
        title,
        message,
        type,
      });
    }

    const options = defaults<ToastOptions, ToastOptions>(titleOrOptions, {
      autoDismiss: true,
      autoDismissDuration: 'fast',
    });

    const translateService = this.injector.get(TranslateService);
    const newToast = new ToastInstanceImpl(
      translateService,
      this.toastSubject,
      options
    );
    return newToast;
  }

  _clearToasts(toasts: Array<IToastInstance>) {
    toasts.forEach(function (toast) {
      toast.dismiss();
    });
  }
}

function handleLineSeparators(text: string) {
  return (
    text
      ?.replace(new RegExp('\n\r', 'g'), '<br />')
      ?.replace(new RegExp('\r\n', 'g'), '<br />')
      ?.replace(new RegExp('\r', 'g'), '<br />')
      ?.replace(new RegExp('\n', 'g'), '<br />') ?? ''
  );
}

class ToastInstanceImpl implements IToastInstance {
  private subscription: Subscription;
  private _dismissObservable: Observable<any>;

  constructor(
    private translateService: TranslateService,
    private toastSubject: Subject<ToastEvent>,
    options?: ToastOptions
  ) {
    let {
      message,
      title,
      autoDismiss,
      autoDismissDuration,
      type,
      onDismiss,
      buttons,
    } = options ?? {};

    this.subscription = new Subscription();

    this._dismissObservable = new Observable((subscriber) => {
      const subscription = new Subscription(() => {
        subscriber.next();
        subscriber.complete();
      });

      this.subscription.add(subscription);
      return subscription;
    }).pipe(
      shareReplay({
        bufferSize: 1,
        refCount: true,
      })
    );

    if (onDismiss) {
      this.subscription.add(() => {
        onDismiss();
      });
    }

    const translationsObservables: Observable<string>[] = [
      !message ? of('') : this.translateService.get(message),
    ];
    if (title) {
      translationsObservables.push(this.translateService.get(title));
    }

    let buttonsHtmlObservable: Observable<string>;
    if (!buttons?.length) {
      buttonsHtmlObservable = of(null);
    } else {
      buttonsHtmlObservable = zip(
        ...buttons.map((btnCfg, index) => {
          return this.translateService.get(btnCfg.text).pipe(
            map((text) => {
              return `<button type="button" class="btn btn-${
                btnCfg.type ?? 'secondary'
              } btn-sm" data-action-id="${
                btnCfg.id ?? index
              }">${text}</button>`;
            })
          );
        })
      ).pipe(
        map((buttonHtmlList) => {
          return `<div class="toast-bottom-actions mt-2 pt-2 d-flex justify-content-end">
          ${buttonHtmlList.join('')}</div>`;
        })
      );
    }

    const subscriptionRef = new WeakRef(this.subscription);
    const thisRef = new WeakRef(this);

    this.subscription.add(
      zip(buttonsHtmlObservable, ...translationsObservables)
        .pipe(observeOn(asapScheduler))
        .subscribe(([buttonsHtml, message, title]) => {
          message = handleLineSeparators(message!);

          let color: string;
          switch (type) {
            case 'success':
              color = 'var(--success)';
              break;
            case 'warning':
              color = 'var(--warning)';
              break;
            case 'error':
              color = 'var(--danger)';
              break;
            case 'info':
            default:
              color = 'var(--info)';
              break;
          }

          let html = [
            `<div class="toast">`,
            title
              ? `<div class="toast-header">
              <svg class="toast-indicator rounded me-2" width="20" height="20"
              xmlns="http://www.w3.org/2000/svg" aria-hidden="true" preserveAspectRatio="xMidYMid slice" focusable="false">
              <rect width="100%" height="100%" fill="${color}"></rect>
              </svg>
              <span class="me-auto">${title}</span>
              <button type="button" class="btn-close pointer" data-bs-dismiss="toast" aria-label="Close"></button>
              </div>`
              : '',
            `<div class="toast-body">${message}`,
            buttonsHtml,
            `</div></div>`,
          ]
            .map((x) => x?.trim())
            .filter((x) => !!x)
            .join('');

          let delay: number;
          switch (autoDismissDuration) {
            case 'medium':
              delay = 3000;
              break;
            case 'slow':
              delay = 4000;
              break;
            case 'fast':
            default:
              delay = 2000;
              break;
          }

          this.toastSubject.next({
            get closed() {
              return subscriptionRef.deref()?.closed;
            },
            fn: (container) => {
              const elTemp = document.createElement('div');
              elTemp.innerHTML = html;
              const toastEl = elTemp.firstChild! as Element;
              container.append(toastEl);

              const toast = new Toast(toastEl, {
                animation: true,
                autohide: autoDismiss,
                delay,
              });
              toast.show();

              subscriptionRef.deref()?.add(
                fromEvent(toastEl, 'hidden.bs.toast').subscribe((e) => {
                  subscriptionRef.deref()?.unsubscribe();

                  requestAnimationFrame(() => {
                    toast.dispose();
                    toastEl.remove();
                  });
                })
              );
              subscriptionRef.deref()?.add(() => {
                toast.hide();
              });

              if (buttons?.length) {
                for (let i = 0; i < buttons.length; ++i) {
                  const btnCfg = buttons[i];
                  if (btnCfg.onClick) {
                    const btnActionId = btnCfg.id ?? i;
                    const btnEl = toastEl.querySelector(
                      `button[data-action-id="${btnActionId}"]`
                    );

                    if (btnEl) {
                      subscriptionRef.deref()?.add(
                        fromEvent(btnEl, 'click').subscribe(() => {
                          btnCfg.onClick(thisRef.deref());
                        })
                      );
                    }
                  }
                }
              }
            },
          });
        })
    );
  }

  onDismiss(): Observable<any> {
    return this._dismissObservable;
  }

  dismiss(): void {
    this.subscription?.unsubscribe();
  }

  dismissIn(ms: number) {
    const subscription = asyncScheduler.schedule(() => {
      this.dismiss();
    }, ms);
    this.subscription?.add(subscription);
    return subscription;
  }

  dismissWhen<T = any>(
    observableOrPromise: Observable<T> | Promise<T>
  ): Subscription {
    const subscription = from(observableOrPromise).subscribe(() => {
      this.dismiss();
    });
    this.subscription?.add(subscription);
    return subscription;
  }
}

let containerPromise: Promise<Element>;
function getOrCreateContainer(): Promise<Element> {
  if (!containerPromise) {
    containerPromise = new Promise((resolve) => {
      requestAnimationFrame(() => {
        const classAux = 'toast-container';
        const elements = document.getElementsByClassName(classAux);
        let element = elements?.[0];
        if (!element) {
          element = document.createElement('div');
          element.classList.add(
            classAux,
            'position-absolute',
            'bottom-0',
            'end-0',
            'p-3'
          );
          document.getElementsByTagName('body')[0].append(element);
        }

        resolve(element);
      });
    });
  }

  return containerPromise;
}
