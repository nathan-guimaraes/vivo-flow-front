import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DateBoxComponent } from 'src/app/shared/components/date-box/date-box.component';
import { FormFilterComponent } from '../../form-filter.component';
import {
  IndicatorFilterFieldDate,
  IndicatorsFilterDTO,
  IndicatorsFilterDTOLike,
} from 'src/app/shared/models/dtos/indicators-filter.dto';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { OffcanvasTemplateComponent } from 'src/app/shared/components/offcanvas-template/offcanvas-template.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SegmentsService } from 'src/app/shared/services/segments.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { NegotiationTypesService } from 'src/app/shared/services/negotiation-types.service';
import { LegaciesService } from 'src/app/shared/services/legacies.service';
import { SuppliersService } from 'src/app/shared/services/suppliers.service';
import { TowersService } from 'src/app/shared/services/towers.service';
import { SelectBoxModule } from 'src/app/shared/components/select-box/select-box.module';
import { OptionModelLike } from 'src/app/shared/models/option.model';
import { FieldModule } from 'src/app/shared/components/field/field.module';

interface FilterFormLike {
  fieldDate: FormControl<IndicatorFilterFieldDate>;
  startDate: FormControl<Date>;
  endDate: FormControl<Date>;
  segmentId: FormControl<number>;
  productId: FormControl<number>;
  negotiationTypeId: FormControl<number>;
  legacyId: FormControl<number>;
  supplierId: FormControl<number>;
  towerId: FormControl<number>;
}

@Component({
  selector: 'app-protocols-volumes-filters',
  templateUrl: 'protocols-volumes-filters.component.html',
  styleUrls: ['protocols-volumes-filters.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    DateBoxComponent,
    SelectBoxModule,
    FieldModule,
  ],
})
export class ProtocolsVolumesFiltersComponent
  extends FormFilterComponent<IndicatorsFilterDTOLike>
  implements OnInit
{
  formGroup: FormGroup<FilterFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  fieldDateDataSource: OptionModelLike<IndicatorFilterFieldDate>[] = [
    {
      value: IndicatorFilterFieldDate.CreatedAt,
      label: this.translateService.instant(
        'indicators.filters.form.fieldDate.dataSource.createdAt'
      ),
    },
    {
      value: IndicatorFilterFieldDate.EndedAt,
      label: this.translateService.instant(
        'indicators.filters.form.fieldDate.dataSource.endedAt'
      ),
    },
  ];

  segmentDataSource = this.segmentsService.list();
  productDataSource = this.productsService.list();
  negotiationTypeDataSource = this.negotiationTypesService.list();
  legacyDataSource = this.legaciesService.list();
  supplierDataSource = this.suppliersService.list();
  towerDataSource = this.towersService.list();

  constructor(
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private segmentsService: SegmentsService,
    private productsService: ProductsService,
    private negotiationTypesService: NegotiationTypesService,
    private legaciesService: LegaciesService,
    private suppliersService: SuppliersService,
    private towersService: TowersService
  ) {
    super();
    this.formGroup = this.formBuilder.group<FilterFormLike>({
      fieldDate: this.formBuilder.control<IndicatorFilterFieldDate>(null),
      startDate: this.formBuilder.control<Date>(null),
      endDate: this.formBuilder.control<Date>(null),
      segmentId: this.formBuilder.control<number>(null),
      productId: this.formBuilder.control<number>(null),
      negotiationTypeId: this.formBuilder.control<number>(null),
      legacyId: this.formBuilder.control<number>(null),
      supplierId: this.formBuilder.control<number>(null),
      towerId: this.formBuilder.control<number>(null),
    });
  }

  ngOnInit(): void {
    this.filtersInputObservable
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((filters) => {
        this.formGroup.reset(filters ?? IndicatorsFilterDTO.default());
      });
  }

  onSubmit() {
    if (this.formGroup.invalid) {
      return;
    }

    const filters = new IndicatorsFilterDTO(this.formGroup.getRawValue());
    this._emitFilters(filters);
  }

  onBtnClearClick() {
    this._emitFilters(IndicatorsFilterDTO.default());
  }
}
