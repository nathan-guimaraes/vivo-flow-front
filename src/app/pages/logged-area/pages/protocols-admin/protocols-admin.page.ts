import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TableSortDirective } from 'src/app/shared/components/table-sort/table-sort.directive';
import { CustomDataSource } from 'src/app/shared/helpers/datasources/custom-datasource';
import {
  ProtocolModel,
  ProtocolPriority,
  ProtocolWithTimersModel,
} from 'src/app/shared/models/protocol.model';
import { ProtocolsService } from 'src/app/shared/services/protocols.service';
import {
  ColumnInfo,
  ProtocolsAdminService,
  TableColumnType,
} from './protocols-admin.service';
import {
  asapScheduler,
  finalize,
  firstValueFrom,
  from,
  map,
  mapTo,
  observeOn,
  startWith,
  switchMap,
} from 'rxjs';
import { DefineColumnsModalComponent } from 'src/app/shared/components/define-columns-modal/define-columns-modal.component';
import { DistributionProtocolsOffcanvasComponent } from 'src/app/shared/components/distribution-protocols-offcanvas/distribution-protocols-offcanvas.component';
import {
  ProtocolFilterLike,
  ProtocolFilterOptionsDTO,
  ProtocolFilterOptionsDTOLike,
} from 'src/app/shared/models/dtos/protocol-filter.dto';
import { DomPortal } from '@angular/cdk/portal';
import { IndicatorSLA } from 'src/app/shared/models/sla.model';
import FileSaver from 'file-saver';
import { GLOBAL_LOADING } from 'src/app/shared/constants/loading-controller.constant';
import { LoadingController } from 'src/app/shared/helpers/loading.controller';
import { ToastService } from 'src/app/shared/services/toast.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Roles } from 'src/app/shared/constants/auth.constant';
import { ProtocolTreatmentsDiagramModalComponent } from 'src/app/shared/components/protocol-treatments-diagram-modal/protocol-treatments-diagram-modal.component';

@Component({
  selector: 'app-protocols-admin-page',
  templateUrl: 'protocols-admin.page.html',
  styleUrls: ['protocols-admin.page.scss'],
  providers: [ProtocolsAdminService],
})
export class ProtocolsAdminPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  @ViewChild('protocolsFilterFormContentEl', { static: true })
  protocolsFilterFormContentElRef: ElementRef<HTMLDivElement>;
  protocolsFilterFormContentPortal: DomPortal<HTMLDivElement>;

  @ViewChild(TableSortDirective, { static: true })
  tableSort: TableSortDirective;

  @ViewChild('cellNumberTpl', { static: true })
  cellNumberTpl: TemplateRef<any>;
  @ViewChild('cellIindicatorSlaTpl', { static: true })
  cellIindicatorSlaTpl: TemplateRef<any>;
  @ViewChild('cellStatusTpl', { static: true })
  cellStatusTpl: TemplateRef<any>;

  private _cellTemplatesMap = new Map<
    string,
    (component: ProtocolsAdminPageComponent) => TemplateRef<any>
  >([
    ['cellNumberTpl', (x) => x.cellNumberTpl],
    ['cellIindicatorSlaTpl', (x) => x.cellIindicatorSlaTpl],
    ['cellStatusTpl', (x) => x.cellStatusTpl],
  ]);

  IndicatorSLA = IndicatorSLA;

  TableColumnType = TableColumnType;
  displayedColumnInfoListObservable = this.protocolsAdminService
    .observeColumnInfoList()
    .pipe(
      map((columnList) => {
        const auxList = columnList.map((column) => {
          if (column.template) {
            const template = this._cellTemplatesMap.get(column.template)?.(
              this
            );

            column = { ...column, template };
          }

          return column;
        });

        return auxList;
      })
    );
  displayedColumnsObservable = this.displayedColumnInfoListObservable.pipe(
    map((list) => {
      return ['selection', 'priority'].concat(list.map((x) => x.name));
    })
  );

  private selectionsSet = new Set<any>();
  private allSelected = false;

  get isAnySelected() {
    return this.isAllSelected() || this.selectionsSet.size > 0;
  }

  private filters: ProtocolFilterLike = null;
  dataSource: CustomDataSource<ProtocolWithTimersModel>;

  canDistributeObservable = this.authService.hasPermission(
    Roles.ProtocolsAdmin.Distribution
  );

  constructor(
    private authService: AuthService,
    private protocolsAdminService: ProtocolsAdminService,
    private protocolsService: ProtocolsService,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.dataSource = new CustomDataSource<ProtocolWithTimersModel>({
      load: (options) => {
        return this.protocolsService.listPaged({
          ...this.filters,
          ...options,
          requireTotalCount: true,
        });
      },
      pageSize: 5,
      initialLoad: true,
    });

    this.tableSort
      .connectToDataSource(this.dataSource)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  ngAfterViewInit(): void {
    this.protocolsFilterFormContentPortal = new DomPortal(
      this.protocolsFilterFormContentElRef
    );
  }

  ngOnDestroy(): void {
    this.dataSource?.dispose();

    this.protocolsFilterFormContentPortal = null;
    this.displayedColumnInfoListObservable = null;
    this.displayedColumnsObservable = null;
  }

  onFiltersChanged(filters: ProtocolFilterLike) {
    this.filters = filters;
    this._reloadData();
  }

  onBtnFiltersClick(tpl: TemplateRef<any>) {
    if (this.offcanvasService.hasOpenOffcanvas()) {
      return;
    }

    this.offcanvasService.open(tpl);
  }

  onBtnDefineColumnsClick() {
    if (this.modalService.hasOpenModals()) {
      return;
    }

    const modalRef = this.modalService.open(DefineColumnsModalComponent, {
      size: 'xxl',
    });

    const componentInstance =
      modalRef.componentInstance as DefineColumnsModalComponent;

    componentInstance.subtitle =
      'protocols-admin.define-columns-modal.subtitle';
    componentInstance.items = this.protocolsAdminService.getColumnInfos();
    componentInstance.selectedItemKeys =
      this.protocolsAdminService.getColumnsSelected();

    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((list) => {
        this.protocolsAdminService.setColumnsSelected(list);
      });
  }

  onBtnAssignClick() {
    if (this.offcanvasService.hasOpenOffcanvas()) {
      return;
    }

    const offcanvasRef = this.offcanvasService.open(
      DistributionProtocolsOffcanvasComponent
    );

    const componentInstance =
      offcanvasRef.componentInstance as DistributionProtocolsOffcanvasComponent;

    const filters = new ProtocolFilterOptionsDTO(this.filters);
    filters.protocolIds = Array.from(this.selectionsSet);
    componentInstance.filters = filters.toBodyParams();

    from(offcanvasRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.clearSelections();
        this._reloadData();
      });
  }

  onBtnRefreshClick() {
    this._reloadData();
  }

  onBtnExportClick() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.protocolsService
      .export({ ...this.filters, protocolIds: Array.from(this.selectionsSet) })
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (blob) => {
          this.toastService.success(
            `protocols-admin.messages.protocols-exported`
          );

          FileSaver.saveAs(blob, blob.name || `protocolos-${Date.now()}.csv`);
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `protocols-admin.errors.cannot-export-protocols`
          );
        },
      });
  }

  openDiagramSteps(protocolId: number) {
    if (this.modalService.hasOpenModals()) {
      return;
    }

    const modalRef = this.modalService.open(
      ProtocolTreatmentsDiagramModalComponent,
      {
        size: 'xl',
      }
    );
    (
      modalRef.componentInstance as ProtocolTreatmentsDiagramModalComponent
    ).protocolId = protocolId;
  }

  async togglePriority(item: ProtocolModel) {
    const hasPermission = await firstValueFrom(this.canDistributeObservable);
    if (!hasPermission) {
      return;
    }

    if (this.globalLoadingController.isShown()) {
      return;
    }

    const priority = !item.priority
      ? ProtocolPriority.Current
      : ProtocolPriority.None;

    this.globalLoadingController.show();
    this.protocolsService
      .setPriority(item.id, priority)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
          this.onBtnRefreshClick();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          item.priority = priority;

          const msg =
            'protocols-admin.messages.' +
            (priority ? 'protocol-priorized' : 'protocol-deprioritized');

          this.toastService.success(msg);
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg =
            'protocols-admin.errors.' +
            (priority
              ? 'cannot-priorize-protocol'
              : 'cannot-deprioritize-protocol');

          this.toastService.error(msg);
        },
      });
  }

  isAllSelected() {
    return this.allSelected;
  }

  toggleAllSelect() {
    this.allSelected = !this.allSelected;
    this.selectionsSet.clear();
  }

  isSelected(item: ProtocolModel) {
    return this.allSelected ? true : this.selectionsSet.has(item?.id);
  }

  toggleSelect(item: ProtocolModel) {
    const key = item?.id;
    if (this.selectionsSet.has(key)) {
      this.selectionsSet.delete(key);
    } else {
      this.selectionsSet.add(key);
    }
  }

  private clearSelections() {
    this.selectionsSet.clear();
    this.allSelected = false;
  }

  private _reloadData() {
    this.dataSource.pageIndex = 0;
    this.dataSource.reload();
  }
}
