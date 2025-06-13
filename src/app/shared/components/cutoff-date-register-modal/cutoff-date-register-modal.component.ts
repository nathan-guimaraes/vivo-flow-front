import {
  Component,
  DestroyRef,
  Inject,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SelectBoxModule } from '../select-box/select-box.module';
import { IconicModule } from '../iconic/iconic.module';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  NgbActiveModal,
  NgbModalModule,
  NgbTooltipModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { FieldModule } from '../field/field.module';
import { CommonModule } from '@angular/common';
import { DateBoxComponent } from '../date-box/date-box.component';
import { finalize, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TowersService } from '../../services/towers.service';
import { NegotiationTypesService } from '../../services/negotiation-types.service';
import { ProductsService } from '../../services/products.service';
import { CdkTableModule } from '@angular/cdk/table';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { HoverClassDirective } from '../../directives/hover-class/hover-class.directive';
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import { CutoffDateModel } from '../../models/cutoff-date.model';
import { CutoffDateService } from '../../services/cutoff-date.service';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { NegotiationTypeModel } from '../../models/negotiation-type.model';
import { ProductModel } from '../../models/product.model';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { PaginationComponent } from '../pagination/pagination.component';

interface CutoffDateFormLike {
  towerId: FormControl<number>;
  negotiationTypeId: FormControl<number>;
  productId: FormControl<number>;
  date: FormControl<Date>;
}

enum TableColumnType {
  Date,
}

type ColumnInfo = {
  name: string;
  label?: string;
  width?: string;
  dataType?: TableColumnType;
};

@Component({
  selector: 'app-cutoff-date-register-modal',
  templateUrl: 'cutoff-date-register-modal.component.html',
  styleUrls: ['cutoff-date-register-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModalModule,
    NgbTooltipModule,
    CdkTableModule,
    ModalTemplateComponent,
    LoadingIndicatorComponent,
    FieldModule,
    SelectBoxModule,
    DateBoxComponent,
    IconicModule,
    HoverClassDirective,
    PaginationComponent,
  ],
})
export class CutoffDateRegisterEditModalComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  formGroup: FormGroup<CutoffDateFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  submitted: boolean;

  towerDataSource = this.towersService.list();
  negotiationTypeDataSource: CustomDataSource<NegotiationTypeModel>;
  productDataSource: CustomDataSource<ProductModel>;

  TableColumnType = TableColumnType;
  displayedColumnInfoList: ColumnInfo[];
  displayedColumns: string[];

  dataSource: CustomDataSource<CutoffDateModel>;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private cutoffDateService: CutoffDateService,
    private towersService: TowersService,
    private negotiationTypesService: NegotiationTypesService,
    private productsService: ProductsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<CutoffDateFormLike>({
      towerId: this.formBuilder.control<number>(null, [Validators.required]),
      negotiationTypeId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
      productId: this.formBuilder.control<number>(null, [Validators.required]),
      date: this.formBuilder.control<Date>(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.displayedColumnInfoList = [
      {
        name: 'tower',
        label: 'cutoff-date-register-modal.table.headers.tower',
        width: '170px',
      },
      {
        name: 'negotiationType',
        label: 'cutoff-date-register-modal.table.headers.negotiationType',
        width: '250px',
      },
      {
        name: 'product',
        label: 'cutoff-date-register-modal.table.headers.product',
        width: '170px',
      },
      {
        name: 'date',
        label: 'cutoff-date-register-modal.table.headers.date',
        width: '120px',
        dataType: TableColumnType.Date,
      },
    ];
    this.displayedColumns = [].concat(
      this.displayedColumnInfoList.map((x) => x.name),
      'actions'
    );

    this.dataSource = new CustomDataSource<CutoffDateModel>({
      load: (options) => {
        return this.cutoffDateService.listPaged({
          ...options,
          requireTotalCount: true,
        });
      },
      pageSize: 5,
    });

    this.negotiationTypeDataSource =
      new CustomRawDataSource<NegotiationTypeModel>({
        load: () => {
          const value = this.f.towerId.getRawValue();
          if (!value) {
            return [];
          }

          return this.negotiationTypesService.listByTowers([value]);
        },
      });
    this.productDataSource = new CustomRawDataSource<ProductModel>({
      load: () => {
        const value = this.f.towerId.getRawValue();
        if (!value) {
          return [];
        }

        return this.productsService.listByTowers([value]);
      },
    });

    const relationships: Array<{
      parentControl: FormControl<any>;
      children: {
        control: FormControl<any>;
        dataSource: CustomDataSource<any>;
      }[];
    }> = [
      {
        parentControl: this.f.towerId,
        children: [
          {
            control: this.f.negotiationTypeId,
            dataSource: this.negotiationTypeDataSource,
          },
          {
            control: this.f.productId,
            dataSource: this.productDataSource,
          },
        ],
      },
    ];

    relationships.forEach(({ parentControl, children }) => {
      parentControl.valueChanges
        .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          children.forEach(({ control, dataSource }) => {
            control.reset();
            if (value) {
              control.enable();
            } else {
              control.disable();
            }

            if (dataSource instanceof CustomRawDataSource) {
              dataSource.clearRawData();
            }

            dataSource.reload();
          });
        });
    });
  }

  ngOnDestroy(): void {
    this.dataSource?.dispose();
    this.negotiationTypeDataSource?.dispose();
    this.productDataSource?.dispose();
  }

  onBtnDeleteClick(item: CutoffDateModel) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.cutoffDateService
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
            `cutoff-date-register-modal.messages.register-deleted`
          );

          this._reloadData();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `cutoff-date-register-modal.errors.cannot-delete-register`
          );
        },
      });
  }

  onSubmit() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.submitted = true;
    if (this.formGroup.invalid) {
      return;
    }

    const values = this.formGroup.getRawValue();

    this.globalLoadingController.show();
    this.cutoffDateService
      .create(values)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `cutoff-date-register-modal.messages.register-created`
          );

          this.submitted = false;
          this.formGroup.reset();
          this._reloadData();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          let msg =
            response.error?.messages?.join('\n') ||
            `cutoff-date-register-modal.errors.cannot-save-register`;

          this.toastService.error(msg);
        },
      });
  }

  private _reloadData() {
    this.dataSource.pageIndex = 0;
    this.dataSource.reload();
  }
}
