import { SlaService } from 'src/app/shared/services/sla.service';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SelectBoxModule } from 'src/app/shared/components/select-box/select-box.module';
import { CustomDataSource } from 'src/app/shared/helpers/datasources/custom-datasource';
import { CustomerModel } from 'src/app/shared/models/customer.model';
import { CustomersService } from 'src/app/shared/services/customers.service';
import { IslandsService } from 'src/app/shared/services/islands.service';
import { ProductsService } from 'src/app/shared/services/products.service';
import { SubislandsService } from 'src/app/shared/services/subislands.service';
import { SubjectsService } from 'src/app/shared/services/subjects.service';
import { TowersService } from 'src/app/shared/services/towers.service';
import { NegotiationTypesService } from 'src/app/shared/services/negotiation-types.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { SuppliersService } from 'src/app/shared/services/suppliers.service';
import { OptionModelLike } from 'src/app/shared/models/option.model';
import { SegmentsService } from 'src/app/shared/services/segments.service';
import { ProtocolFilterLike } from 'src/app/shared/models/dtos/protocol-filter.dto';
import { IndicatorSLA } from 'src/app/shared/models/sla.model';
import { ProtocolPriority } from 'src/app/shared/models/protocol.model';
import { ProtocolsService } from 'src/app/shared/services/protocols.service';

interface FilterFormLike {
  number: FormControl<string>;
  status: FormControl<number>;
  towers: FormControl<number[]>;
  islands: FormControl<number[]>;
  subislands: FormControl<number[]>;
  subjects: FormControl<number[]>;
  segments: FormControl<number[]>;
  partnerCodes: FormControl<string[]>;
  documents: FormControl<string[]>;
  codeGroups: FormControl<string[]>;
  customerCodes: FormControl<string[]>;
  negotiationTypes: FormControl<number[]>;
  products: FormControl<number[]>;
  userIds: FormControl<number[]>;
  suppliers: FormControl<number[]>;
  priorities: FormControl<ProtocolPriority[]>;
  slas: FormControl<number[]>;
}

@Component({
  selector: 'app-protocols-filter-form',
  templateUrl: 'protocols-filter-form.component.html',
  styleUrls: ['protocols-filter-form.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, SelectBoxModule],
})
export class ProtocolsFilterFormComponent
  implements OnChanges, OnInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  @Input()
  filters: ProtocolFilterLike;
  @Output()
  readonly filtersChange = new EventEmitter<ProtocolFilterLike>();

  formGroup: FormGroup<FilterFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  statusesDataSource = this.protocolsService.listAllStatuses();
  towerDataSource = this.towersService.list();
  islandDataSource = this.islandsService.list();
  subislandDataSource = this.subislandsService.list();
  subjectDataSource = this.subjectsService.list();
  segmentsDataSource = this.segmentsService.list();
  partnerCodesDataSource = this.customersService.listPartnerCodes();
  customerDocumentDataSource: CustomDataSource<CustomerModel>;
  customerCodeGroupDataSource: CustomDataSource<CustomerModel>;
  customerCodeDataSource: CustomDataSource<CustomerModel>;
  negotiationTypeDataSource = this.negotiationTypesService.list();
  productDataSource = this.productsService.list();
  usersDataSource = this.usersService.listSimpleUsers();
  suppliersDataSource = this.suppliersService.list();
  priorityDataSource: OptionModelLike<boolean>[] = [
    {
      label: this.translateService.instant('defaults.not'),
      value: false,
    },
    {
      label: this.translateService.instant('defaults.yes'),
      value: true,
    },
  ];

  slaDataSource: OptionModelLike<IndicatorSLA>[] = [
    {
      label: this.translateService.instant('sla.indicators.normal'),
      value: IndicatorSLA.Normal,
    },
    {
      label: this.translateService.instant('sla.indicators.warning'),
      value: IndicatorSLA.Warning,
    },
    {
      label: this.translateService.instant('sla.indicators.danger'),
      value: IndicatorSLA.Danger,
    },
  ];
  // slaDataSource = this.slaService.list();

  selectedTextExpr = (x) => null;

  constructor(
    private formBuilder: FormBuilder,
    private protocolsService: ProtocolsService,
    private customersService: CustomersService,
    private negotiationTypesService: NegotiationTypesService,
    private productsService: ProductsService,
    private usersService: UsersService,
    private towersService: TowersService,
    private islandsService: IslandsService,
    private subislandsService: SubislandsService,
    private subjectsService: SubjectsService,
    private segmentsService: SegmentsService,
    private suppliersService: SuppliersService,
    private translateService: TranslateService
  ) {
    this.formGroup = this.formBuilder.group<FilterFormLike>({
      number: this.formBuilder.control<string>(null),
      status: this.formBuilder.control<number>(null),
      towers: this.formBuilder.control<number[]>(null),
      islands: this.formBuilder.control<number[]>(null),
      subislands: this.formBuilder.control<number[]>(null),
      subjects: this.formBuilder.control<number[]>(null),
      segments: this.formBuilder.control<number[]>(null),
      partnerCodes: this.formBuilder.control<string[]>(null),
      documents: this.formBuilder.control<string[]>(null),
      codeGroups: this.formBuilder.control<string[]>(null),
      customerCodes: this.formBuilder.control<string[]>(null),
      negotiationTypes: this.formBuilder.control<number[]>(null),
      products: this.formBuilder.control<number[]>(null),
      userIds: this.formBuilder.control<number[]>(null),
      suppliers: this.formBuilder.control<number[]>(null),
      priorities: this.formBuilder.control<ProtocolPriority[]>(null),
      slas: this.formBuilder.control<number[]>(null),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.filters) {
      this.formGroup.reset(this.filters);
    }
  }

  ngOnInit(): void {
    this.customerDocumentDataSource = new CustomDataSource({
      load: (options) => {
        return this.customersService.listPagedCustomer({
          ...options,
          searchText: null,
          document: options?.searchText,
        });
      },
    });
    this.customerCodeGroupDataSource = new CustomDataSource({
      load: (options) => {
        return this.customersService.listPagedCustomer({
          ...options,
          searchText: null,
          codeGroup: options?.searchText,
        });
      },
    });
    this.customerCodeDataSource = new CustomDataSource({
      load: (options) => {
        return this.customersService.listPagedCustomer({
          ...options,
          searchText: null,
          code: options?.searchText,
        });
      },
    });

    this.formGroup.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const values = this.formGroup.getRawValue();
        this.filters = values;
        this.filtersChange.emit(this.filters);
      });
  }

  ngOnDestroy(): void {
    this.customerDocumentDataSource?.dispose();
    this.customerCodeGroupDataSource?.dispose();
    this.customerCodeDataSource?.dispose();
  }
}
