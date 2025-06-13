import {
  Component,
  DestroyRef,
  OnDestroy,
  OnInit,
  TemplateRef,
  Type,
  ViewChild,
  inject,
} from '@angular/core';
import { SingleDataSource } from 'src/app/shared/helpers/datasources/single-datasource';
import { DashboardService } from 'src/app/shared/services/dashboard.service';
import { ProtocolsVolumesFiltersComponent } from './filters/protocols-volumes-filters/protocols-volumes-filters.component';
import { FormFilterManager } from './form-filter.manager';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { IndicatorsFilterDTOLike } from 'src/app/shared/models/dtos/indicators-filter.dto';
import { FormFilterComponent } from './form-filter.component';
import { Observable, first, from, merge, of, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProtocolVolumeInfoLike } from 'src/app/shared/models/protocol-volume-info.model';
import { CutoffDateInfoLike } from 'src/app/shared/models/cutoff-date-info.model';
import { CutoffDateFiltersComponent } from './filters/cutoff-date-filters/cutoff-date-filters.component';
import { DefaultFiltersComponent } from './filters/default-filters/default-filters.component';
import { ProductivityInfoLike } from 'src/app/shared/models/productivity-info.model';
import { TreatmentTimeInfoLike } from 'src/app/shared/models/treatment-time-info.model';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from 'src/app/shared/services/toast.service';
import { DisapprovalTreatmentsInfoLike } from 'src/app/shared/models/disapproval-treatments-info.model';

interface IndicatorCardCfgLike<
  T extends IndicatorsFilterDTOLike = IndicatorsFilterDTOLike
> {
  title: string;
  subtitle?: string;
  template?: TemplateRef<any>;
  dataSource?: SingleDataSource<any[]>;
  filterTemplate?: Type<FormFilterComponent<T>>;
  filters?: Observable<T>;
  setFilters?: (filters: T) => void;
  templateRendered?: boolean;
}

@Component({
  selector: 'app-indicators-page',
  templateUrl: 'indicators.page.html',
  styleUrls: ['indicators.page.scss'],
  providers: [FormFilterManager],
})
export class IndicatorsPageComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  @ViewChild('chartBarTpl', { static: true })
  chartBarTpl: TemplateRef<any>;
  @ViewChild('protocolsVolumesChartTpl', { static: true })
  protocolsVolumesChartTpl: TemplateRef<any>;
  @ViewChild('cutoffDateChartTpl', { static: true })
  cutoffDateChartTpl: TemplateRef<any>;
  @ViewChild('productivityChartTpl', { static: true })
  productivityChartTpl: TemplateRef<any>;
  @ViewChild('treatmentTimeChartTpl', { static: true })
  treatmentTimeChartTpl: TemplateRef<any>;
  @ViewChild('disapprovalTreatmentsChartTpl', { static: true })
  disapprovalTreatmentsChartTpl: TemplateRef<any>;

  @ViewChild('testTpl', { static: false })
  testTpl: any;

  indicatorCfgList: IndicatorCardCfgLike[];

  constructor(
    private dashboardService: DashboardService,
    private filtersManager: FormFilterManager,
    private offcanvas: NgbOffcanvas,
    private translateService: TranslateService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.indicatorCfgList = [
      {
        title: 'indicators.sessions.indicators.cards.protocol-volumetry.title',
        filterTemplate: ProtocolsVolumesFiltersComponent,
        filters: this.filtersManager.observeProtocolsVolumesFilter(),
        setFilters: (filters) => {
          this.filtersManager.setProtocolsVolumesFilter(filters);
        },
        dataSource: new SingleDataSource<
          ProtocolVolumeInfoLike[],
          IndicatorsFilterDTOLike
        >((filters) => {
          return this.dashboardService.getProtocolVolumes(filters);
        }, false),
        template: this.protocolsVolumesChartTpl,
      },
      {
        title: 'indicators.sessions.indicators.cards.cutoff-date.title',
        filterTemplate: CutoffDateFiltersComponent,
        filters: this.filtersManager.observeCutoffDatesFilter(),
        setFilters: (filters) => {
          this.filtersManager.setCutoffDatesFilter(filters);
        },
        dataSource: new SingleDataSource<
          CutoffDateInfoLike[],
          IndicatorsFilterDTOLike
        >((filters) => {
          return this.dashboardService.getCutoffDates(filters);
        }, false),
        template: this.cutoffDateChartTpl,
      },
      {
        title: 'indicators.sessions.indicators.cards.sla.title',
        template: this.chartBarTpl,
      },
      {
        title: 'indicators.sessions.indicators.cards.productivity.title',
        filterTemplate: DefaultFiltersComponent,
        filters: this.filtersManager.observeProductivityFilter(),
        setFilters: (filters) => {
          this.filtersManager.setProductivityFilter(filters);
        },
        dataSource: new SingleDataSource<
          ProductivityInfoLike[],
          IndicatorsFilterDTOLike
        >((filters) => {
          return this.dashboardService.getProductivities(filters);
        }, false),
        template: this.productivityChartTpl,
      },
      {
        title: 'indicators.sessions.indicators.cards.treatment-time.title',
        filterTemplate: DefaultFiltersComponent,
        filters: this.filtersManager.observeTreatmentTimeFilter(),
        setFilters: (filters) => {
          this.filtersManager.setTreatmentTimeFilter(filters);
        },
        dataSource: new SingleDataSource<
          TreatmentTimeInfoLike[],
          IndicatorsFilterDTOLike
        >((filters) => {
          return this.dashboardService.getTreatmentTimes(filters);
        }, false),
        template: this.treatmentTimeChartTpl,
      },
      {
        title: 'indicators.sessions.indicators.cards.performance.title',
      },
      {
        title:
          'indicators.sessions.indicators.cards.disapproval-treatments.title',
        filterTemplate: DefaultFiltersComponent,
        filters: this.filtersManager.observeDisapprovalTreatmentsFilter(),
        setFilters: (filters) => {
          this.filtersManager.setDisapprovalTreatmentsFilter(filters);
        },
        dataSource: new SingleDataSource<
          DisapprovalTreatmentsInfoLike[],
          IndicatorsFilterDTOLike
        >((filters) => {
          return this.dashboardService.getDisapprovalTreatments(filters);
        }, false),
        template: this.disapprovalTreatmentsChartTpl,
      },
      {
        title: 'indicators.sessions.indicators.cards.calendar-report.title',
        subtitle:
          'indicators.sessions.indicators.cards.calendar-report.subtitle',
      },
    ];

    this.indicatorCfgList?.forEach((x) => {
      if (x.filters && x.dataSource) {
        x.filters
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((filters) => {
            x.dataSource.params = filters;

            if (x.templateRendered) {
              x.dataSource.reload();
            }
          });
      } else if (x.dataSource) {
        x.dataSource.load();
      }

      if (x.dataSource) {
        x.dataSource.errors
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((response) => {
            if (!response) {
              return;
            }

            const title = this.translateService.instant(x.title);
            const msg = this.translateService.instant(
              `indicators.sessions.indicators.errors.cannot-load-indicator`,
              { value: title }
            );

            this.toastService.error(msg);
          });
      }
    });
  }

  ngOnDestroy(): void {
    this.indicatorCfgList?.forEach((x) => {
      x.dataSource?.dispose();
    });

    this.indicatorCfgList = null;
  }

  onIndicatorTemplateRendered(cfg: IndicatorCardCfgLike) {
    cfg.templateRendered = true;
    cfg.dataSource.reload();
  }

  onIndicatorRefreshClick(cfg: IndicatorCardCfgLike) {
    const { dataSource, filters } = cfg;
    if (!dataSource) {
      return;
    }

    let observable: Observable<any>;
    if (filters) {
      observable = filters.pipe(first());
    } else {
      observable = of(null);
    }

    observable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filters) => {
        dataSource.load(filters);
      });
  }

  onIndicatorFilterClick(cfg: IndicatorCardCfgLike) {
    if (this.offcanvas.hasOpenOffcanvas()) {
      return;
    }

    const offcanvasRef = this.offcanvas.open(cfg.filterTemplate);
    const component =
      offcanvasRef.componentInstance as FormFilterComponent<any>;

    component.filterTitle = cfg.title;

    if (cfg.filters || cfg.setFilters) {
      const offcanvasDestroyObservable = merge(
        offcanvasRef.closed,
        offcanvasRef.dismissed
      ).pipe(first());

      if (cfg.filters) {
        cfg.filters
          .pipe(
            takeUntil(offcanvasDestroyObservable),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe((filters) => {
            component.filters = filters;
          });
      }

      if (cfg.setFilters) {
        component.filtersChange
          .pipe(
            takeUntil(offcanvasDestroyObservable),
            takeUntilDestroyed(this.destroyRef)
          )
          .subscribe((filters) => {
            cfg.setFilters(filters);
          });
      }
    }
  }
}
