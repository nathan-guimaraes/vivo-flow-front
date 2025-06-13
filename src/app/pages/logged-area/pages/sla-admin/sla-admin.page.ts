import { DomPortal } from '@angular/cdk/portal';
import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { finalize, from } from 'rxjs';
import { SlaRegisterModalComponent } from 'src/app/shared/components/sla-register-modal/sla-register-modal.component';
import { SlaUpdateModalComponent } from 'src/app/shared/components/sla-update-modal/sla-update-modal.component';
import { GLOBAL_LOADING } from 'src/app/shared/constants/loading-controller.constant';
import { CustomDataSource } from 'src/app/shared/helpers/datasources/custom-datasource';
import { CustomRawDataSource } from 'src/app/shared/helpers/datasources/custom-raw-datasource';
import { LoadingController } from 'src/app/shared/helpers/loading.controller';
import { SlaFilterLike } from 'src/app/shared/models/dtos/sla-filter.dto';
import { SlaModel } from 'src/app/shared/models/sla.model';
import { SlaService } from 'src/app/shared/services/sla.service';
import { ToastService } from 'src/app/shared/services/toast.service';

type ColumnInfo = {
  name: string;
  label?: string;
  width?: string;
  template?: any;
};

@Component({
  selector: 'app-sla-admin-page',
  templateUrl: 'sla-admin.page.html',
  styleUrls: ['sla-admin.page.scss'],
})
export class SlaAdminPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  @ViewChild('slaFilterFormContentEl', { static: true })
  slaFilterFormContentElRef: ElementRef<HTMLDivElement>;
  slaFilterFormContentPortal: DomPortal<HTMLDivElement>;

  private filters: SlaFilterLike = null;
  dataSource: CustomDataSource<SlaModel>;

  @ViewChild('cellSlaTpl', { static: true })
  cellSlaTpl: TemplateRef<any>;

  displayedColumnInfoList: ColumnInfo[];
  displayedColumns: string[];

  constructor(
    private slaService: SlaService,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.displayedColumnInfoList = [
      {
        name: 'tower',
        label: 'sla-admin.table.headers.tower',
        width: '150px',
      },
      {
        name: 'island',
        label: 'sla-admin.table.headers.island',
        width: '180px',
      },
      {
        name: 'subisland',
        label: 'sla-admin.table.headers.subisland',
        width: '190px',
      },
      {
        name: 'subject',
        label: 'sla-admin.table.headers.subject',
        width: '160px',
      },
      {
        name: 'negotiationType',
        label: 'sla-admin.table.headers.negotiationType',
        width: '170px',
      },
      {
        name: 'product',
        label: 'sla-admin.table.headers.product',
        width: '100px',
      },
      {
        name: 'segment',
        label: 'sla-admin.table.headers.segment',
        width: '160px',
      },
      {
        name: 'time',
        label: 'sla-admin.table.headers.sla',
        width: '150px',
        template: this.cellSlaTpl,
      },
    ];
    this.displayedColumns = [].concat(
      this.displayedColumnInfoList.map((x) => x.name),
      ['actions']
    );

    this.dataSource = new CustomDataSource<SlaModel>({
      load: (options) => {
        return this.slaService.listPaged({
          ...this.filters,
          ...options,
          requireTotalCount: true,
        });
      },
      pageSize: 5,
    });
  }

  ngAfterViewInit(): void {
    this.slaFilterFormContentPortal = new DomPortal(
      this.slaFilterFormContentElRef
    );
  }

  ngOnDestroy(): void {
    this.dataSource?.dispose();

    this.slaFilterFormContentPortal = null;
  }

  onFiltersChanged(filters: SlaFilterLike) {
    this.filters = filters;
    this._reloadData();
  }

  onBtnFiltersClick(tpl: TemplateRef<any>) {
    if (this.offcanvasService.hasOpenOffcanvas()) {
      return;
    }

    this.offcanvasService.open(tpl);
  }

  onBtnRefreshClick() {
    this._reloadData();
  }

  onBtnNewRegisterClick() {
    if (this.modalService.hasOpenModals()) {
      return;
    }

    const modalRef = this.modalService.open(SlaRegisterModalComponent, {
      size: 'xl',
    });
    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this._reloadData();
      });
  }

  onBtnDeleteClick(item: SlaModel) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.slaService
      .delete(item.id)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(`sla-admin.messages.sla-deleted`);

          this._reloadData();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(`sla-admin.errors.cannot-delete-sla`);
        },
      });
  }

  onBtnEditClick(item: SlaModel) {
    if (this.modalService.hasOpenModals()) {
      return;
    }

    const modalRef = this.modalService.open(SlaUpdateModalComponent, {
      size: 'md',
    });
    (modalRef.componentInstance as SlaUpdateModalComponent).model = item;

    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this._reloadData();
      });
  }

  private _reloadData() {
    this.dataSource.pageIndex = 0;
    this.dataSource.reload();
  }
}
