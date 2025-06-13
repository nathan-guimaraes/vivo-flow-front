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
import { DelegateActivitiesModalComponent } from 'src/app/shared/components/delegate-activities-modal/delegate-activities-modal.component';
import { TableSortDirective } from 'src/app/shared/components/table-sort/table-sort.directive';
import { UsersSkillsModalComponent } from 'src/app/shared/components/users-skills-modal/users-skills-modal.component';
import { UsersStatusEditModalComponent } from 'src/app/shared/components/users-status-edit-modal/users-status-edit-modal.component';
import { GLOBAL_LOADING } from 'src/app/shared/constants/loading-controller.constant';
import { CustomDataSource } from 'src/app/shared/helpers/datasources/custom-datasource';
import { LoadingController } from 'src/app/shared/helpers/loading.controller';
import {
  UserFilterLike,
  UserFilterOptionsDTO,
  UserFilterOptionsDTOLike,
} from 'src/app/shared/models/dtos/user-filter.dto';
import { UserModel } from 'src/app/shared/models/user.model';
import { ToastService } from 'src/app/shared/services/toast.service';
import { UsersService } from 'src/app/shared/services/users.service';
import FileSaver from 'file-saver';
import { DomPortal } from '@angular/cdk/portal';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Roles } from 'src/app/shared/constants/auth.constant';

enum TableColumnType {
  Date,
}

type ColumnInfo = {
  name: string;
  label?: string;
  width?: string;
  dataType?: TableColumnType;
  cellTemplate?: TemplateRef<any>;
};

@Component({
  selector: 'app-users-admin-page',
  templateUrl: 'users-admin.page.html',
  styleUrls: ['users-admin.page.scss'],
})
export class UsersAdminPageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  @ViewChild('usersFilterFormContentEl', { static: true })
  usersFilterFormContentElRef: ElementRef<HTMLDivElement>;
  usersFilterFormContentPortal: DomPortal<HTMLDivElement>;

  @ViewChild('nameCellTpl', { static: true })
  nameCellTpl: TemplateRef<any>;

  @ViewChild(TableSortDirective, { static: true })
  tableSort: TableSortDirective;

  TableColumnType = TableColumnType;
  displayedColumnInfoList: ColumnInfo[];
  displayedColumns: string[];

  private selectionsSet = new Set<number>();
  private allSelected = false;

  get isAnySelected() {
    return this.isAllSelected() || this.selectionsSet.size > 0;
  }

  private filters: UserFilterLike;
  dataSource: CustomDataSource<UserModel>;

  canExportObservable = this.authService.hasPermission(Roles.UserAdmin.Report);
  canSetSkillsObservable = this.authService.hasPermission(
    Roles.UserAdmin.Skills
  );
  canSetStatusObservable = this.authService.hasPermission(
    Roles.UserAdmin.Status
  );
  canDelegateObservable = this.authService.hasPermission(
    Roles.UserAdmin.Delegate
  );

  constructor(
    private authService: AuthService,
    private usersService: UsersService,
    private modalService: NgbModal,
    private offcanvasService: NgbOffcanvas,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.displayedColumnInfoList = [
      {
        name: 'login',
        label: 'users-admin.table.headers.login',
        width: '90px',
      },
      {
        name: 'profile',
        label: 'users-admin.table.headers.profile',
        width: '90px',
      },
      {
        name: 'name',
        label: 'users-admin.table.headers.name',
        width: '150px',
        cellTemplate: this.nameCellTpl,
      },
      {
        name: 'supervisor',
        label: 'users-admin.table.headers.supervisor',
        width: '150px',
      },
      {
        name: 'workscale',
        label: 'users-admin.table.headers.workscale',
      },
      {
        name: 'workload',
        label: 'users-admin.table.headers.workload',
      },
      {
        name: 'worktime',
        label: 'users-admin.table.headers.worktime',
      },
      {
        name: 'supplier',
        label: 'users-admin.table.headers.supplier',
        width: '100px',
      },
      {
        name: 'status',
        label: 'users-admin.table.headers.status',
        width: '90px',
      },
      {
        name: 'returnedAt',
        label: 'users-admin.table.headers.returnedAt',
        width: '100px',
        dataType: TableColumnType.Date,
      },
    ];
    this.displayedColumns = ['selection'].concat(
      this.displayedColumnInfoList.map((x) => x.name)
    );

    this.dataSource = new CustomDataSource<UserModel>({
      load: (options) => {
        return this.usersService.listPaged({
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
    this.usersFilterFormContentPortal = new DomPortal(
      this.usersFilterFormContentElRef
    );
  }

  ngOnDestroy(): void {
    this.dataSource?.dispose();

    this.usersFilterFormContentPortal = null;
  }

  onFiltersChanged(filters: UserFilterLike) {
    this.filters = filters;
    this._reloadData();
  }

  onBtnFiltersClick(tpl: TemplateRef<any>) {
    if (this.offcanvasService.hasOpenOffcanvas()) {
      return;
    }

    this.offcanvasService.open(tpl);
  }

  onBtnSkillsClick() {
    if (this.modalService.hasOpenModals() || !this.isAnySelected) {
      return;
    }

    this._openSkillsModal();
  }

  onBtnEditStatusClick() {
    if (this.modalService.hasOpenModals() || !this.isAnySelected) {
      return;
    }

    const modalRef = this.modalService.open(UsersStatusEditModalComponent, {
      size: 'sm',
    });

    const componentInstance =
      modalRef.componentInstance as UsersStatusEditModalComponent;

    const filters = new UserFilterOptionsDTO(this.filters);
    filters.userIds = Array.from(this.selectionsSet);
    componentInstance.filters = filters.toBodyParams();

    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.dataSource.reload();
        this.clearSelections();
      });
  }

  onBtnDelegateClick() {
    if (this.modalService.hasOpenModals()) {
      return;
    }

    const modalRef = this.modalService.open(DelegateActivitiesModalComponent, {
      size: 'md',
    });

    const componentInstance =
      modalRef.componentInstance as DelegateActivitiesModalComponent;

    const filters = new UserFilterOptionsDTO(this.filters);
    filters.userIds = Array.from(this.selectionsSet);
    componentInstance.filters = filters.toBodyParams();

    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.dataSource.reload();
        this.clearSelections();
      });
  }

  onBtnExportClick() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.usersService
      .export({ ...this.filters, userIds: Array.from(this.selectionsSet) })
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (blob) => {
          this.toastService.success(`users-admin.messages.users-exported`);

          FileSaver.saveAs(blob, blob.name || `usuarios-${Date.now()}.csv`);
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(`users-admin.errors.cannot-export-users`);
        },
      });
  }

  onBtnRefreshClick() {
    this._reloadData();
  }

  onUserClick(item: UserModel) {
    if (this.modalService.hasOpenModals()) {
      return;
    }

    const { componentInstance } = this._openSkillsModal();
    componentInstance.userDetailsMode = true;
    componentInstance.userId = item.id;
    if (componentInstance.filters) {
      componentInstance.filters.userIds = [item.id];
    }
  }

  isAllSelected() {
    return this.allSelected;
  }

  toggleAllSelect() {
    this.allSelected = !this.allSelected;
    this.selectionsSet.clear();
  }

  isSelected(item: UserModel) {
    return this.allSelected ? true : this.selectionsSet.has(item?.id);
  }

  toggleSelect(item: UserModel) {
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

  private _openSkillsModal() {
    const modalRef = this.modalService.open(UsersSkillsModalComponent, {
      size: 'xxl',
    });

    const componentInstance =
      modalRef.componentInstance as UsersSkillsModalComponent;

    const filters = new UserFilterOptionsDTO(this.filters);
    filters.userIds = Array.from(this.selectionsSet);
    componentInstance.filters = filters.toBodyParams();

    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.dataSource.reload();
        this.clearSelections();
      });

    return { modalRef, componentInstance };
  }
}
