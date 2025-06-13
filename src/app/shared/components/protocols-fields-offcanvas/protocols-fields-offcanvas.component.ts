import { CommonModule } from '@angular/common';
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
import { OffcanvasTemplateComponent } from '../offcanvas-template/offcanvas-template.component';
import { TowersService } from '../../services/towers.service';
import { IslandsService } from '../../services/islands.service';
import { SubislandsService } from '../../services/subislands.service';
import { NegotiationTypesService } from '../../services/negotiation-types.service';
import { SegmentsService } from '../../services/segments.service';
import { ProductsService } from '../../services/products.service';
import { LegaciesService } from '../../services/legacies.service';
import { CdkTableModule } from '@angular/cdk/table';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import {
  ProtocolFieldDealingModel,
  ProtocolFieldModel,
} from '../../models/protocol-field.model';
import { ProtocolsService } from '../../services/protocols.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IslandModel } from '../../models/island.model';
import { SubislandModel } from '../../models/subisland.model';
import { ProductModel } from '../../models/product.model';
import { NegotiationTypeModel } from '../../models/negotiation-type.model';
import { Subscription, distinctUntilChanged, finalize, startWith } from 'rxjs';
import { OptionModelLike } from '../../models/option.model';
import { ProtocolFieldChangesDTOLike } from '../../models/dtos/protocol-field.dto';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { ToastService } from '../../services/toast.service';
import { ArrayUtils } from '../../utils/array.utils';
import { NgScrollbarModule } from 'ngx-scrollbar';

interface FieldFilterFormLike {
  towerId: FormControl<number>;
  islandId: FormControl<number>;
  subislandId: FormControl<number>;
  legacyIds: FormControl<number[]>;
  negotiationTypeIds: FormControl<number[]>;
  segmentIds: FormControl<number[]>;
  productIds: FormControl<number[]>;
  isManual: FormControl<boolean>;
}

@Component({
  selector: 'app-protocols-fields-offcanvas',
  templateUrl: 'protocols-fields-offcanvas.component.html',
  styleUrls: ['protocols-fields-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    CdkTableModule,
    NgScrollbarModule,
    OffcanvasTemplateComponent,
    CheckboxComponent,
    SelectBoxModule,
    LoadingIndicatorComponent,
  ],
})
export class ProtocolsFieldsOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  formGroup: FormGroup<FieldFilterFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  towerDataSource = this.towersService.list();
  islandDataSource: CustomDataSource<IslandModel>;
  subislandDataSource: CustomDataSource<SubislandModel>;
  legacyDataSource = this.legaciesService.list();
  negotiationTypeDataSource: CustomDataSource<NegotiationTypeModel>;
  segmentDataSource = this.segmentsService.list();
  productDataSource: CustomDataSource<ProductModel>;

  manualDataSource: OptionModelLike<boolean>[] = [
    {
      value: true,
      label: this.translateService.instant('defaults.manual'),
    },
    {
      value: false,
      label: this.translateService.instant('defaults.automatic'),
    },
  ];

  selectedTextExpr = (x) => null;

  fieldList: ProtocolFieldModel[] = [];
  private fieldDealingMap = new Map<number, ProtocolFieldDealingModel[]>();

  get tableHeight() {
    return Math.min(this.fieldList?.length ?? 0, 10) * 50;
  }

  loadingController = new LoadingController();
  private updateFieldListSubscription: Subscription;

  private selectionsSet = new Set<ProtocolFieldModel>();
  private allSelected = false;

  allRequired = false;
  allActive = false;

  displayedColumns: string[] = ['selection', 'label', 'required', 'active'];

  private changesMap = new Map<number, ProtocolFieldChangesDTOLike>();
  hasChanges = false;

  get isControlsDisabled() {
    return this.formGroup.invalid;
  }

  private isMultipleModeActive = false;

  private loadFieldsSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private towersService: TowersService,
    private islandsService: IslandsService,
    private subislandsService: SubislandsService,
    private negotiationTypesService: NegotiationTypesService,
    private segmentsService: SegmentsService,
    private productsService: ProductsService,
    private legaciesService: LegaciesService,
    private protocolsService: ProtocolsService,
    private translateService: TranslateService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<FieldFilterFormLike>({
      towerId: this.formBuilder.control<number>(null, [Validators.required]),
      islandId: this.formBuilder.control<number>(null, [Validators.required]),
      subislandId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
      legacyIds: this.formBuilder.control<number[]>(null, [
        Validators.required,
      ]),
      negotiationTypeIds: this.formBuilder.control<number[]>(null, [
        Validators.required,
      ]),
      segmentIds: this.formBuilder.control<number[]>(null, [
        Validators.required,
      ]),
      productIds: this.formBuilder.control<number[]>(null, [
        Validators.required,
      ]),
      isManual: this.formBuilder.control<boolean>(null, [Validators.required]),
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
            control: this.f.islandId,
            dataSource: this.islandDataSource,
          },
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
      {
        parentControl: this.f.islandId,
        children: [
          {
            control: this.f.subislandId,
            dataSource: this.subislandDataSource,
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

    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isMultipleModeActive = [
          this.f.legacyIds,
          this.f.negotiationTypeIds,
          this.f.productIds,
          this.f.segmentIds,
        ].some((control) => {
          const list = control.getRawValue();
          return list?.length > 1;
        });

        this.updateFields();
      });

    this.f.isManual.valueChanges
      .pipe(
        startWith(null),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        this.loadFields();
      });
  }

  ngOnDestroy(): void {
    this.islandDataSource?.dispose();
    this.subislandDataSource?.dispose();
    this.negotiationTypeDataSource?.dispose();
    this.productDataSource?.dispose();
  }

  onBtnSaveChangesClick() {
    if (this.globalLoadingController.isShown() || !this.changesMap?.size) {
      return;
    }

    const filters = this.formGroup.getRawValue();
    const changes = Array.from(this.changesMap.values());

    this.globalLoadingController.show();
    this.protocolsService
      .setFieldChanges(changes, filters)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `protocols-fields-offcanvas.messages.changes-saved`
          );

          this.updateFields();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `protocols-fields-offcanvas.errors.cannot-save-changes`
          );
        },
      });
  }

  onRequiredAllChanged(value: boolean) {
    const items = this.getSelectedItems();
    this.setChanges(
      items.map((item) => {
        return { fieldId: item.id, required: value };
      })
    );
  }

  onActiveAllChanged(value: boolean) {
    const items = this.getSelectedItems();
    this.setChanges(
      items.map((item) => {
        return { fieldId: item.id, active: value };
      })
    );
  }

  onRequiredChanged(item: ProtocolFieldModel, value: boolean) {
    this.setChanges([{ fieldId: item.id, required: value }]);
  }

  onActiveChanged(item: ProtocolFieldModel, value: boolean) {
    this.setChanges([{ fieldId: item.id, active: value }]);
  }

  isRequired(item: ProtocolFieldModel) {
    return !!(
      this.changesMap.get(item.id)?.required ?? this.getField(item.id)?.required
    );
  }

  isActive(item: ProtocolFieldModel) {
    return !!(
      this.changesMap.get(item.id)?.active ?? this.getField(item.id)?.active
    );
  }

  isAnySelected() {
    return this.selectionsSet.size > 0;
  }

  isAllSelected() {
    return this.allSelected;
  }

  toggleAllSelect() {
    this.allSelected = !this.allSelected;

    if (!this.allSelected) {
      this.selectionsSet.clear();
    } else {
      this.selectionsSet = new Set(this.getItems());
    }
  }

  isSelected(item: ProtocolFieldModel) {
    return this.selectionsSet.has(item);
  }

  toggleSelect(item: ProtocolFieldModel) {
    if (this.selectionsSet.has(item)) {
      this.selectionsSet.delete(item);
    } else {
      this.selectionsSet.add(item);
    }

    this.allSelected = this.getItems().length === this.selectionsSet.size;
  }

  private loadFields() {
    this.loadFieldsSubscription?.unsubscribe();

    this.loadingController.show();
    this.loadFieldsSubscription = this.protocolsService
      .listFields(this.f.isManual.getRawValue())
      .pipe(
        finalize(() => {
          this.loadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (list) => {
          this.fieldList = list;
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `protocols-fields-offcanvas.errors.cannot-load-list`
          );
        },
      });
  }

  private updateFields() {
    this.hasChanges = false;
    this.changesMap.clear();

    this.selectionsSet.clear();
    this.allSelected = false;

    this.allRequired = false;
    this.allActive = false;

    this.fieldDealingMap.clear();
    this.updateFieldListSubscription?.unsubscribe();
    if (this.formGroup.invalid) {
      return;
    }

    if (this.isMultipleModeActive) {
      this.toastService.warning(
        `protocols-fields-offcanvas.warnings.selected-multiple-filters`
      );
    }

    const filters = this.formGroup.getRawValue();

    this.loadingController.show();
    this.updateFieldListSubscription = this.protocolsService
      .listFieldsDealing(filters)
      .pipe(
        finalize(() => {
          this.loadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (list) => {
          this.fieldDealingMap = ArrayUtils.groupBy(list, (x) => x.id);
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `protocols-fields-offcanvas.errors.cannot-load-list`
          );
        },
      });
  }

  private setChanges(
    changes: Array<{ fieldId: number; required?: boolean; active?: boolean }>
  ) {
    for (let { fieldId, required, active } of changes) {
      let itemChange = this.changesMap.get(fieldId);
      if (!itemChange) {
        itemChange = {
          fieldId,
          required,
          active,
        };
        this.changesMap.set(fieldId, itemChange);
      } else {
        itemChange.required = required ?? itemChange.required;
        itemChange.active = active ?? itemChange.active;
      }
    }

    this.hasChanges = false;
    for (let itemChange of this.changesMap.values()) {
      const field = this.getField(itemChange.fieldId);

      if (
        !field ||
        (typeof itemChange.required === 'boolean' &&
          itemChange.required !== field.required) ||
        (typeof itemChange.active === 'boolean' &&
          itemChange.active !== field.active)
      ) {
        this.hasChanges = true;
        break;
      }
    }
  }

  private getSelectedItems() {
    return Array.from(this.selectionsSet);
  }

  private getField(fieldId: number) {
    if (this.isMultipleModeActive) {
      return null;
    }

    const list = this.fieldDealingMap.get(fieldId);
    if (!list || list.length > 1) {
      return null;
    }

    return list[0];
  }

  private getItems() {
    return this.fieldList;
  }
}
