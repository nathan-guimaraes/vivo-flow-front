import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SelectBoxModule } from 'src/app/shared/components/select-box/select-box.module';
import { IslandsService } from 'src/app/shared/services/islands.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { SubislandsService } from 'src/app/shared/services/subislands.service';
import { SubjectsService } from 'src/app/shared/services/subjects.service';
import { TowersService } from 'src/app/shared/services/towers.service';
import { NegotiationTypesService } from 'src/app/shared/services/negotiation-types.service';
import { SegmentsService } from 'src/app/shared/services/segments.service';
import { ProductivityFilterLike } from 'src/app/shared/models/dtos/productivity-filter.dto';
import { CustomDataSource } from 'src/app/shared/helpers/datasources/custom-datasource';
import { CustomRawDataSource } from 'src/app/shared/helpers/datasources/custom-raw-datasource';
import { NegotiationTypeModel } from 'src/app/shared/models/negotiation-type.model';
import { ProductModel } from 'src/app/shared/models/product.model';
import { Observable, startWith } from 'rxjs';

interface FilterFormLike {
  towers: FormControl<number[]>;
  islands: FormControl<number[]>;
  subislands: FormControl<number[]>;
  subjects: FormControl<number[]>;
  segments: FormControl<number[]>;
  negotiationTypes: FormControl<number[]>;
  products: FormControl<number[]>;
}

@Component({
  selector: 'app-productivity-filter-form',
  templateUrl: 'productivity-filter-form.component.html',
  styleUrls: ['productivity-filter-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, SelectBoxModule],
})
export class ProductivityFilterFormComponent
  implements OnChanges, OnInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  @Input()
  filters: ProductivityFilterLike;
  @Output()
  readonly filtersChange = new EventEmitter<ProductivityFilterLike>();

  formGroup: FormGroup<FilterFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  towerDataSource = this.towersService.list();
  islandDataSource = this.islandsService.list();
  subislandDataSource = this.subislandsService.list();
  subjectDataSource = this.subjectsService.list();
  segmentsDataSource = this.segmentsService.list();
  negotiationTypeDataSource: CustomRawDataSource<NegotiationTypeModel>;
  productDataSource: CustomRawDataSource<ProductModel>;

  selectedTextExpr = (x) => null;

  constructor(
    private formBuilder: FormBuilder,
    private negotiationTypesService: NegotiationTypesService,
    private productsService: ProductsService,
    private towersService: TowersService,
    private islandsService: IslandsService,
    private subislandsService: SubislandsService,
    private subjectsService: SubjectsService,
    private segmentsService: SegmentsService
  ) {
    this.formGroup = this.formBuilder.group<FilterFormLike>({
      towers: this.formBuilder.control<number[]>(null),
      islands: this.formBuilder.control<number[]>(null),
      subislands: this.formBuilder.control<number[]>(null),
      subjects: this.formBuilder.control<number[]>(null),
      segments: this.formBuilder.control<number[]>(null),
      negotiationTypes: this.formBuilder.control<number[]>(null),
      products: this.formBuilder.control<number[]>(null),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filters) {
      this.formGroup.reset(this.filters);
    }
  }

  ngOnInit(): void {
    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const values = this.formGroup.getRawValue();
        this.filters = values;
        this.filtersChange.emit(this.filters);
      });

    this.negotiationTypeDataSource =
      new CustomRawDataSource<NegotiationTypeModel>({
        load: () => {
          const value = this.f.towers.getRawValue();
          if (!value) {
            return this.negotiationTypesService.listAll();
          }

          return this.negotiationTypesService.listByTowers(value);
        },
      });

    this.productDataSource = new CustomRawDataSource<ProductModel>({
      load: () => {
        const value = this.f.towers.getRawValue();
        if (!value) {
          return this.productsService.listAll();
        }

        return this.productsService.listByTowers(value);
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
        parentControl: this.f.towers,
        children: [
          {
            control: this.f.negotiationTypes,
            dataSource: this.negotiationTypeDataSource,
          },
          {
            control: this.f.products,
            dataSource: this.productDataSource,
          },
        ],
      },
    ];

    relationships.forEach(({ parentControl, children }) => {
      parentControl.valueChanges
        .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          setTimeout(() => {
            children.forEach(({ control, dataSource }) => {
              control.reset();

              if (dataSource instanceof CustomRawDataSource) {
                dataSource.clearRawData();
              }

              dataSource.reload();
            });
          });
        });
    });
  }

  ngOnDestroy(): void {
    this.negotiationTypeDataSource?.dispose();
    this.productDataSource?.dispose();
  }
}
