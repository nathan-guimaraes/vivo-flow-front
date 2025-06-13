import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  inject,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { EChartsOption, SeriesOption } from 'echarts';
import orderBy from 'lodash/orderBy';
import { Observable, delay, map, of, share, zip } from 'rxjs';
import {
  SeriesChartSourceLike,
  ChartOptionsLike,
} from 'src/app/shared/components/multiple-horizontal-chartbar/multiple-horizontal-chartbar.component';
import { SingleDataSource } from 'src/app/shared/helpers/datasources/single-datasource';
import {
  DashboardService,
  MenuIndicatorsInfoLike,
} from 'src/app/shared/services/dashboard.service';
import { ToastService } from 'src/app/shared/services/toast.service';

interface MenuItem {
  image?: string;
  title: string;
  path?: string;
  chartListDataSource?: SingleDataSource<ChartOptionsLike[]>;
}

@Component({
  selector: 'app-home-page',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePageComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  menuItems: MenuItem[];

  constructor(
    private dashboardService: DashboardService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.menuItems = [
      {
        image: 'assets/images/indicadores-page.svg',
        title: 'home.menu-items.indicators.title',
        path: '../indicators',
        // chartListDataSource: new SingleDataSource<ChartOptionsLike[]>(() => {
        //   const observable = this.dashboardService
        //     .getMenuIndicatorsInfo()
        //     .pipe(share());
        //   return zip(
        //     observable.pipe(
        //       map((info) => {
        //         return this._generateBarChartOptions(
        //           'home.menu-items.indicators.info-list.protocols.title',
        //           [
        //             {
        //               name: 'home.menu-items.indicators.info-list.protocols.items.protocols-worked',
        //               color: 'var(--bs-primary)',
        //               value: info.protocolsWorkedCount,
        //             },
        //             {
        //               name: 'home.menu-items.indicators.info-list.protocols.items.protocols-finished',
        //               color: 'var(--bs-success)',
        //               value: info.protocolsFinishedCount,
        //             },
        //           ]
        //         );
        //       })
        //     ),
        //     observable.pipe(
        //       map((info) => {
        //         return this._generateBarChartOptions(
        //           'home.menu-items.indicators.info-list.productivity.title',
        //           [
        //             {
        //               name: 'home.menu-items.indicators.info-list.productivity.items.productivity-real',
        //               color: 'var(--bs-primary-lighter)',
        //               value: info.productivityRealCount,
        //             },
        //             {
        //               name: 'home.menu-items.indicators.info-list.productivity.items.productivity-reference',
        //               color: 'var(--bs-warning)',
        //               value: info.productivityReferenceCount,
        //             },
        //           ]
        //         );
        //       })
        //     )
        //   );
        // }),
      },
      {
        image: 'assets/images/bolsao-page.svg',
        title: 'home.menu-items.protocols.title',
        path: '../protocols',
        chartListDataSource: new SingleDataSource<ChartOptionsLike[]>(() => {
          const observable = this.dashboardService.getMenuProtocolsInfo();
          return zip(
            observable.pipe(
              map((info) => {
                return this._generateBarChartOptions(
                  'home.menu-items.protocols.info-list.protocols-pending.title',
                  [
                    {
                      name: 'home.menu-items.protocols.info-list.protocols-pending.items.total-protocols-pending',
                      color: 'var(--bs-success)',
                      value:
                        info.protocolsPendingOutOfSlaCount +
                        info.protocolsPendingPausedCount +
                        info.protocolsPendingPrioritizedCount,
                    },
                    {
                      name: 'home.menu-items.protocols.info-list.protocols-pending.items.out-sla',
                      color: 'var(--bs-accent-light)',
                      value: info.protocolsPendingOutOfSlaCount,
                    },
                    {
                      name: 'home.menu-items.protocols.info-list.protocols-pending.items.paused',
                      color: 'var(--bs-primary-lighter)',
                      value: info.protocolsPendingPausedCount,
                    },
                    {
                      name: 'home.menu-items.protocols.info-list.protocols-pending.items.prioritized',
                      color: 'var(--bs-warning)',
                      value: info.protocolsPendingPrioritizedCount,
                    },
                  ]
                );
              })
            )
          );
        }),
      },
      {
        image: 'assets/images/adm-usuarios-page.svg',
        title: 'home.menu-items.users-admin.title',
        path: '../users-admin',
        chartListDataSource: new SingleDataSource<ChartOptionsLike[]>(() => {
          const observable = this.dashboardService
            .getMenuUsersInfo()
            .pipe(share());
          return zip(
            observable.pipe(
              map((info) => {
                return this._generateBarChartOptions(
                  'home.menu-items.users-admin.info-list.active-users.title',
                  [
                    {
                      name: 'home.menu-items.users-admin.info-list.active-users.items.total-active-users',
                      color: 'var(--bs-primary)',
                      value:
                        info.usersActiveOnlineCount +
                        info.usersActivePausedCount +
                        info.usersActiveOfflineCount,
                    },
                    {
                      name: 'home.menu-items.users-admin.info-list.active-users.items.users-online',
                      color: 'var(--bs-success)',
                      value: info.usersActiveOnlineCount,
                    },
                    {
                      name: 'home.menu-items.users-admin.info-list.active-users.items.users-paused',
                      color: 'var(--bs-warning)',
                      value: info.usersActivePausedCount,
                    },
                    {
                      name: 'home.menu-items.users-admin.info-list.active-users.items.users-offline',
                      color: 'var(--bs-accent)',
                      value: info.usersActiveOfflineCount,
                    },
                  ]
                );
              })
            ),
            observable.pipe(
              map((info) => {
                return this._generateBarChartOptions(
                  'home.menu-items.users-admin.info-list.new-users.title',
                  [
                    {
                      name: 'home.menu-items.users-admin.info-list.new-users.items.new-users',
                      color: 'var(--bs-primary-lighter)',
                      value: info.newUsersCount,
                    },
                  ]
                );
              })
            )
          );
        }),
      },
      {
        image: 'assets/images/adm-ferramentas.svg',
        title: 'home.menu-items.system-admin.title',
        path: '../system-admin',
      },
    ];
  }

  ngOnDestroy(): void {
    this.menuItems?.forEach((item) => {
      item?.chartListDataSource?.dispose();
    });
  }

  private _generateBarChartOptions(
    title: string,
    items: SeriesChartSourceLike[]
  ): ChartOptionsLike {
    items = this._orderSeriesChartSource(items);

    return { chartTitle: title, items };
  }

  private _orderSeriesChartSource(items: SeriesChartSourceLike[]) {
    return orderBy(items, (x) => x.value, 'desc');
  }
}
