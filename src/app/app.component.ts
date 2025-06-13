import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { AuthService } from './shared/services/auth.service';
import { GLOBAL_LOADING } from './shared/constants/loading-controller.constant';
import { LoadingController } from './shared/helpers/loading.controller';
import { ToastService } from './shared/services/toast.service';
import {
  EMPTY,
  debounceTime,
  filter,
  first,
  fromEvent,
  merge,
  mergeWith,
  skip,
  startWith,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs';
import { IconicRegister } from './shared/components/iconic/iconic-register';
import { AppConfigService } from './shared/services/app-config.service';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { RxBroadcastChannel } from '@rxjs-toolkit/broadcast-channel';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  constructor(
    private appConfig: AppConfigService,
    private router: Router,
    private authService: AuthService,
    private iconicRegister: IconicRegister,
    @Inject(DOCUMENT) private _document: Document,
    @Inject(GLOBAL_LOADING) public globalLoadingController: LoadingController,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const { appConfig } = this;

    this.authService
      .observeAuthenticated()
      .pipe(skip(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((aBool) => {
        if (!aBool && environment.production && appConfig.loginUrl) {
          location.href = appConfig.loginUrl;
        } else {
          location.reload();
        }
      });

    this.setupInactivityEvents();

    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationStart) {
          this.globalLoadingController.show();
        } else if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.globalLoadingController.hide();

          if (event instanceof NavigationError) {
            this.toastService.error('defaults.errors.cannotLoadPage');
          }
        }
      });

    //#region Icons
    this.iconicRegister
      .setBasePath('assets/icons/')
      .add('clock', 'clock.svg')
      .add('play-fill', 'play-fill.svg')
      .add('user-circle', 'user-circle.svg')
      .add('star', 'star.svg')
      .add('warning', 'warning.svg')
      .add('close', 'close.svg')
      .add('close-circle-fill', 'close-circle-fill.svg')
      .add('pause-circle-fill', 'pause-circle-fill.svg')
      .add('check-circle-fill', 'check-circle-fill.svg')
      .add('plus', 'plus.svg')
      .add('edit', 'edit.svg')
      .add('trash', 'trash.svg')
      .add('arrow-up', 'arrow-up.svg')
      .add('arrow-left', 'arrow-left.svg')
      .add('arrow-down1', 'arrow-down1.svg')
      .add('download', 'download.svg')
      .add('upload', 'upload.svg')
      .add('refresh', 'refresh.svg')
      .add('eraser', 'eraser.svg')
      .add('calendar', 'calendar.svg')
      .add('search', 'search.svg')
      .add('filter', 'filter.svg')
      .add('info', 'info.svg')
      .add('loading', 'loading.svg');
    //#endregion
  }

  private setupInactivityEvents() {
    const seconds = this.appConfig.logoutOnInactivitySeconds;
    if (!seconds || seconds < 0) {
      return;
    }

    const { authService } = this;

    const domEvents: (keyof DocumentEventMap)[] = [
      'wheel',
      'mousedown',
      'mousemove',
      'mouseup',
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
      'keydown',
      'keyup',
    ];

    const broadcastChannel = new RxBroadcastChannel('dom-activity');
    this.destroyRef.onDestroy(() => {
      broadcastChannel.dispose();
    });

    const domEventsObservable = merge(
      ...domEvents.map((eventName) => fromEvent(this._document, eventName))
    ).pipe(
      throttleTime(100),
      tap((e) => {
        broadcastChannel.postMessage(e.type);
      }),
      mergeWith(broadcastChannel.events),
      startWith(null),
      debounceTime(seconds * 1000),
      first()
    );

    authService
      .observeAuthenticated()
      .pipe(
        switchMap((aBool) => {
          if (!aBool) {
            return EMPTY;
          }

          return domEventsObservable;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        authService.signOut();
      });
  }
}
