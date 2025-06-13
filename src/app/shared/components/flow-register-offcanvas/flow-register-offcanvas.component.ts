import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Inject,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { IconicModule } from '../iconic/iconic.module';
import { TranslateModule } from '@ngx-translate/core';
import { OffcanvasTemplateComponent } from '../offcanvas-template/offcanvas-template.component';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { Observable, finalize, shareReplay, startWith } from 'rxjs';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { HoverClassDirective } from '../../directives/hover-class/hover-class.directive';
import { FlowService } from '../../services/flow.service';
import { FlowModel } from '../../models/flow.model';
import { FieldModule } from '../field/field.module';
import { SelectBoxModule } from '../select-box/select-box.module';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TowersService } from '../../services/towers.service';
import { ProductsService } from '../../services/products.service';
import { NegotiationTypesService } from '../../services/negotiation-types.service';
import { SegmentsService } from '../../services/segments.service';
import { NegotiationTypeModel } from 'src/app/shared/models/negotiation-type.model';
import { ProductModel } from 'src/app/shared/models/product.model';
import { IslandModel } from 'src/app/shared/models/island.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import FileSaver from 'file-saver';
import { FlowFilterLike } from 'src/app/shared/models/dtos/flow-filter.dto';
import { PaginationComponent } from '../pagination/pagination.component';

interface FlowFiltersFormLike {
  towerId: FormControl<number>;
  productIds: FormControl<number[]>;
  segmentIds: FormControl<number[]>;
  negotiationTypeIds: FormControl<number[]>;
}

@Component({
  selector: 'app-flow-register-offcanvas',
  templateUrl: 'flow-register-offcanvas.component.html',
  styleUrls: ['flow-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbAlertModule,
    NgbTooltipModule,
    OffcanvasTemplateComponent,
    FieldModule,
    SelectBoxModule,
    IconicModule,
    LoadingIndicatorComponent,
    HoverClassDirective,
    PaginationComponent,
  ],
})
export class FlowRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  private filters: FlowFilterLike;

  formGroup: FormGroup<FlowFiltersFormLike> =
    this.formBuilder.group<FlowFiltersFormLike>({
      towerId: this.formBuilder.control<number>(null, [Validators.required]),
      productIds: this.formBuilder.control<number[]>(null, [
        Validators.required,
        Validators.min(1),
      ]),
      segmentIds: this.formBuilder.control<number[]>(null, [
        Validators.required,
        Validators.min(1),
      ]),
      negotiationTypeIds: this.formBuilder.control<number[]>(null, [
        Validators.required,
        Validators.min(1),
      ]),
    });

  get f() {
    return this.formGroup.controls;
  }

  get isFormInvalid() {
    return this.formGroup.invalid;
  }

  selectedTextExpr = (x) => null;

  error: string = null;

  submitted = false;

  towerDataSource = this.towersService.list();
  negotiationTypeDataSource: CustomDataSource<NegotiationTypeModel>;
  segmentDataSource = this.segmentsService.list();
  productDataSource: CustomDataSource<ProductModel>;

  logsDataSource: CustomDataSource<FlowModel>;
  logsObservable: Observable<FlowModel[]>;

  constructor(
    private formBuilder: FormBuilder,
    private flowService: FlowService,
    private towersService: TowersService,
    private productsService: ProductsService,
    private segmentsService: SegmentsService,
    private negotiationTypesService: NegotiationTypesService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.logsDataSource = new CustomDataSource<FlowModel>({
      load: (options) => {
        return this.flowService.listPaged({
          ...this.filters,
          ...options,
          requireTotalCount: true,
        });
      },
      pageSize: 5,
      initialLoad: true,
    });

    this.logsObservable = this.logsDataSource.toObservable().pipe(
      shareReplay({
        refCount: false,
        bufferSize: 1,
      })
    );

    this.negotiationTypeDataSource = new CustomRawDataSource<IslandModel>({
      load: () => {
        const value = this.f.towerId.getRawValue();
        if (!value) {
          return [];
        }

        return this.negotiationTypesService.listByTowers([value]);
      },
    });

    this.productDataSource = new CustomRawDataSource<IslandModel>({
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
            control: this.f.negotiationTypeIds,
            dataSource: this.negotiationTypeDataSource,
          },
          {
            control: this.f.productIds,
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
    this.logsDataSource?.dispose();
    this.logsObservable = null;

    this.negotiationTypeDataSource?.dispose();
    this.productDataSource?.dispose();
  }

  onBtnDownloadTemplateClick() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    if (this.isFormInvalid) {
      return;
    }

    const filters = this.formGroup.getRawValue();

    this.globalLoadingController.show();
    this.flowService
      .downloadImportTemplate(filters)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (blob) => {
          this.toastService.success(
            `flow-register-offcanvas.messages.flow-template-downloaded`
          );

          FileSaver.saveAs(
            blob,
            blob.name || `fluxo-modelo-${Date.now()}.xlsx`
          );
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `flow-register-offcanvas.errors.cannot-download-template`
          );
        },
      });
  }

  onImportFlowFileChanged(inputEl: HTMLInputElement) {
    this.error = null;

    const file = inputEl.files?.item?.(0);
    if (!file || this.globalLoadingController.isShown() || this.isFormInvalid) {
      inputEl.value = '';
      return;
    }

    const filters = this.formGroup.getRawValue();

    this.globalLoadingController.show();
    this.flowService
      .importFlow(filters, file)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();

          inputEl.value = '';
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `flow-register-offcanvas.messages.flow-imported`
          );

          this.logsDataSource.clearCache();
          this.logsDataSource.reload();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          let msg = response.error?.messages?.join('\n');

          this.error = msg;

          this.toastService.error(
            msg || `flow-register-offcanvas.errors.cannot-import-flow`
          );
        },
      });
  }

  onDownloadFlowClick(id: number) {
    this.globalLoadingController.show();
    this.flowService
      .downloadFlow(id)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.toastService.success(
            `flow-register-offcanvas.messages.flow-template-downloaded`
          );

          FileSaver.saveAs(response.blob, response.name);
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `flow-register-offcanvas.errors.cannot-download-flow`
          );
        },
      });
  }
}
