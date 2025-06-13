import {
  Component,
  DestroyRef,
  Inject,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectBoxModule } from '../select-box/select-box.module';
import { IconicModule } from '../iconic/iconic.module';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { FieldModule } from '../field/field.module';
import { CommonModule } from '@angular/common';
import { DateBoxComponent } from '../date-box/date-box.component';
import { TowersService } from '../../services/towers.service';
import { IslandsService } from '../../services/islands.service';
import { SubislandsService } from '../../services/subislands.service';
import { SubjectsService } from '../../services/subjects.service';
import { NegotiationTypesService } from '../../services/negotiation-types.service';
import { SegmentsService } from '../../services/segments.service';
import { ProductivityService } from '../../services/productivity.service';
import { ProductsService } from '../../services/products.service';
import { finalize, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { IslandModel } from '../../models/island.model';
import { NegotiationTypeModel } from '../../models/negotiation-type.model';
import { SubislandModel } from '../../models/subisland.model';
import { SubjectModel } from '../../models/subject.model';
import { ProductModel } from '../../models/product.model';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';

interface ProductivityFormLike {
  towerId: FormControl<number>;
  islandId: FormControl<number>;
  subislandId: FormControl<number>;
  subjectId: FormControl<number>;
  negotiationTypeId: FormControl<number>;
  productId: FormControl<number>;
  segmentId: FormControl<number>;
  quantityProductivity: FormControl<number>;
}

@Component({
  selector: 'app-productivity-register-modal',
  templateUrl: 'productivity-register-modal.component.html',
  styleUrls: ['productivity-register-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModalModule,
    ModalTemplateComponent,
    FieldModule,
    SelectBoxModule,
    DateBoxComponent,
    IconicModule,
  ],
})
export class ProductivityRegisterModalComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  formGroup: FormGroup<ProductivityFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  submitted: boolean;

  towerDataSource = this.towersService.list();
  islandDataSource: CustomRawDataSource<IslandModel>;
  subislandDataSource: CustomRawDataSource<SubislandModel>;
  subjectDataSource: CustomRawDataSource<SubjectModel>;
  negotiationTypeDataSource: CustomRawDataSource<NegotiationTypeModel>;
  productDataSource: CustomRawDataSource<ProductModel>;
  segmentDataSource = this.segmentsService.list();

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private productivityService: ProductivityService,
    private towersService: TowersService,
    private islandsService: IslandsService,
    private subislandsService: SubislandsService,
    private subjectsService: SubjectsService,
    private negotiationTypesService: NegotiationTypesService,
    private segmentsService: SegmentsService,
    private productsService: ProductsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<ProductivityFormLike>({
      towerId: this.formBuilder.control<number>(null, [Validators.required]),
      islandId: this.formBuilder.control<number>(null, [Validators.required]),
      subislandId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
      subjectId: this.formBuilder.control<number>(null),
      negotiationTypeId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
      productId: this.formBuilder.control<number>(null, [Validators.required]),
      segmentId: this.formBuilder.control<number>(null, [Validators.required]),
      quantityProductivity: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
    });
  }

  ngOnInit(): void {
    this.islandDataSource = new CustomRawDataSource<IslandModel>({
      load: () => {
        const value = this.f.towerId.getRawValue();
        if (!value) {
          return [];
        }

        return this.islandsService.listByTowers([value]);
      },
    });
    this.subislandDataSource = new CustomRawDataSource<SubislandModel>({
      load: () => {
        const value = this.f.islandId.getRawValue();
        if (!value) {
          return [];
        }

        return this.subislandsService.listByIslands([value]);
      },
    });
    this.subjectDataSource = new CustomRawDataSource<SubjectModel>({
      load: () => {
        const value = this.f.subislandId.getRawValue();
        if (!value) {
          return [];
        }

        return this.subjectsService.listBySubislands([value]);
      },
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
            control: this.f.islandId,
            dataSource: this.islandDataSource,
          },
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
      {
        parentControl: this.f.islandId,
        children: [
          {
            control: this.f.subislandId,
            dataSource: this.subislandDataSource,
          },
        ],
      },
      {
        parentControl: this.f.subislandId,
        children: [
          {
            control: this.f.subjectId,
            dataSource: this.subjectDataSource,
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
    this.islandDataSource?.dispose();
    this.subislandDataSource?.dispose();
    this.subjectDataSource?.dispose();
    this.negotiationTypeDataSource?.dispose();
    this.productDataSource?.dispose();
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
    this.productivityService
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
            `productivity-register-modal.messages.productivityRegistered`
          );
          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg =
            response.error?.messages?.join('\n') ||
            `productivity-register-modal.errors.cannot-save-productivity`;

          this.toastService.error(msg);
        },
      });
  }
}
