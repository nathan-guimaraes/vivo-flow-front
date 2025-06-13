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
import { ProductivityRegisterModalComponent } from 'src/app/shared/components/productivity-register-modal/productivity-register-modal.component';
import { ProductivityUpdateModalComponent } from 'src/app/shared/components/productivity-update-modal/productivity-update-modal.component';
import { GLOBAL_LOADING } from 'src/app/shared/constants/loading-controller.constant';
import { CustomDataSource } from 'src/app/shared/helpers/datasources/custom-datasource';
import { LoadingController } from 'src/app/shared/helpers/loading.controller';
import { ProductivityFilterLike } from 'src/app/shared/models/dtos/productivity-filter.dto';
import { ProductivityModel } from 'src/app/shared/models/productivity.model';
import { ProductivityService } from 'src/app/shared/services/productivity.service';
import { ToastService } from 'src/app/shared/services/toast.service';

type ColumnInfo = {
  name: string;
  label?: string;
  width?: string;
};

@Component({
  selector: 'app-productivity-admin-page',
  templateUrl: 'productivity-admin.page.html',
  styleUrls: ['productivity-admin.page.scss'],
})
export class ProductivityAdminPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  @ViewChild('productivityFilterFormContentEl', { static: true })
  productivityFilterFormContentElRef: ElementRef<HTMLDivElement>;
  productivityFilterFormContentPortal: DomPortal<HTMLDivElement>;

  private filters: ProductivityFilterLike = null;
  dataSource: CustomDataSource<ProductivityModel>;

  displayedColumnInfoList: ColumnInfo[];
  displayedColumns: string[];

  constructor(
    private productivityService: ProductivityService,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.displayedColumnInfoList = [
      {
        name: 'tower',
        label: 'productivity-admin.table.headers.tower',
        width: '170px',
      },
      {
        name: 'island',
        label: 'productivity-admin.table.headers.island',
        width: '170px',
      },
      {
        name: 'subisland',
        label: 'productivity-admin.table.headers.subisland',
        width: '170px',
      },
      {
        name: 'subject',
        label: 'productivity-admin.table.headers.subject',
        width: '190px',
      },
      {
        name: 'segment',
        label: 'productivity-admin.table.headers.segment',
        width: '150px',
      },
      {
        name: 'negotiationType',
        label: 'productivity-admin.table.headers.negotiationType',
        width: '160px',
      },
      {
        name: 'product',
        label: 'productivity-admin.table.headers.product',
        width: '90px',
      },
      {
        name: 'quantityProductivity',
        label: 'productivity-admin.table.headers.productivity',
        width: '120px',
      },
    ];
    this.displayedColumns = [].concat(
      this.displayedColumnInfoList.map((x) => x.name),
      ['actions']
    );

    this.dataSource = new CustomDataSource<ProductivityModel>({
      load: (options) => {
        return this.productivityService.listPaged({
          ...this.filters,
          ...options,
          requireTotalCount: true,
        });
      },
      pageSize: 5,
    });
  }

  ngAfterViewInit(): void {
    this.productivityFilterFormContentPortal = new DomPortal(
      this.productivityFilterFormContentElRef
    );
  }

  ngOnDestroy(): void {
    this.dataSource?.dispose();

    this.productivityFilterFormContentPortal = null;
  }

  onFiltersChanged(filters: ProductivityFilterLike) {
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

    const modalRef = this.modalService.open(
      ProductivityRegisterModalComponent,
      {
        size: 'xl',
      }
    );
    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this._reloadData();
      });
  }

  onBtnDeleteClick(item: ProductivityModel) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.productivityService
      .delete(item.id)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `productivity-admin.messages.productivityDeleted`
          );

          this._reloadData();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `productivity-admin.errors.cannotDeleteProductivity`
          );
        },
      });
  }

  onBtnEditClick(item: ProductivityModel) {
    if (this.modalService.hasOpenModals()) {
      return;
    }

    const modalRef = this.modalService.open(ProductivityUpdateModalComponent, {
      size: 'sm',
    });
    (modalRef.componentInstance as ProductivityUpdateModalComponent).model =
      item;

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
