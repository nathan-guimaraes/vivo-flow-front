import {
  Component,
  DestroyRef,
  Inject,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { Subscription, finalize, from, map, repeat, startWith } from 'rxjs';
import { ConfirmsDialog } from 'src/app/shared/components/confirms-dialog/confirms-dialog.service';
import { DealingProtocolsModalComponent } from 'src/app/shared/components/dealing-protocols-modal/dealing-protocols-modal.component';
import { FinishWorkModalComponent } from 'src/app/shared/components/finish-work-modal/finish-work-modal.component';
import { PauseProtocolModalComponent } from 'src/app/shared/components/pause-protocol-modal/pause-protocol-modal.component';
import { StepItemLike } from 'src/app/shared/components/stepper/stepper.component';
import { GLOBAL_LOADING } from 'src/app/shared/constants/loading-controller.constant';
import { RxCountTimer } from 'src/app/shared/helpers/count-timer/count-timer';
import { CustomDataSource } from 'src/app/shared/helpers/datasources/custom-datasource';
import { CustomRawDataSource } from 'src/app/shared/helpers/datasources/custom-raw-datasource';
import { LoadingController } from 'src/app/shared/helpers/loading.controller';
import { TimeSpan } from 'src/app/shared/helpers/time-span/time-span';
import { DealingSubreasonModel } from 'src/app/shared/models/dealing-subreason.model';
import { DealingSubreason2Model } from 'src/app/shared/models/dealing-subreason2.model';
import { OptionModelLike } from 'src/app/shared/models/option.model';
import {
  ProtocolFieldDealingModel,
  ProtocolFieldModel,
} from 'src/app/shared/models/protocol-field.model';
import {
  ProtocolDetailsModelLike,
  ProtocolModelLike,
} from 'src/app/shared/models/protocol.model';
import {
  TreatmentStepModel,
  TreatmentStepStatus,
} from 'src/app/shared/models/treatment-step.model';
import { WorkStatusOption } from 'src/app/shared/models/user.model';
import { DealingReasonsService } from 'src/app/shared/services/dealing-reasons.service';
import { DealingSubreason2Service } from 'src/app/shared/services/dealing-subreason2.service';
import { DealingSubreasonsService } from 'src/app/shared/services/dealing-subreasons.service';
import { IslandsService } from 'src/app/shared/services/islands.service';
import { LegaciesService } from 'src/app/shared/services/legacies.service';
import { NegotiationTypesService } from 'src/app/shared/services/negotiation-types.service';
import { ProtocolActionsService } from 'src/app/shared/services/protocol-actions.service';
import { ProtocolsService } from 'src/app/shared/services/protocols.service';
import { SegmentsService } from 'src/app/shared/services/segments.service';
import { SubislandsService } from 'src/app/shared/services/subislands.service';
import { SubjectsService } from 'src/app/shared/services/subjects.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TowersService } from 'src/app/shared/services/towers.service';
import { TreatmentService } from 'src/app/shared/services/treatment.service';

interface ProtocolInfoFormLike {
  id: FormControl<number>;
  number: FormControl<string>;
  customer: FormControl<string>;
  document: FormControl<string>;
  segmentId: FormControl<number>;
  stepLegacy: FormControl<string>;
  createdAt: FormControl<Date>;
  dynamicFields: FormGroup;
}

interface ProtocolActionFormLike {
  dynamicFields: FormGroup;
  actionId: FormControl<number>;
  reason: FormControl<number>;
  subreason: FormControl<number>;
  subreason2: FormControl<number>;
  observation: FormControl<string>;
}

interface ProtocolFormLike {
  automatic: FormGroup<ProtocolInfoFormLike>;
  manual: FormGroup<ProtocolActionFormLike>;
}

interface FieldCfgLike {
  length?: number;
  transform?: (value: any) => number;
  template?: (component: ProtocolDealingsPageComponent) => TemplateRef<any>;
}

const numberMaxLengthCache = new Map<number, number>();

@Component({
  selector: 'app-protocol-dealings-page',
  templateUrl: 'protocol-dealings.page.html',
  styleUrls: ['protocol-dealings.page.scss'],
})
export class ProtocolDealingsPageComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  @ViewChild('textFieldTpl', { static: true })
  textFieldTpl: TemplateRef<any>;
  @ViewChild('numericFieldTpl', { static: true })
  numericFieldTpl: TemplateRef<any>;
  @ViewChild('numberFieldTpl', { static: true })
  numberFieldTpl: TemplateRef<any>;
  @ViewChild('currencyFieldTpl', { static: true })
  currencyFieldTpl: TemplateRef<any>;
  @ViewChild('yesNotFieldTpl', { static: true })
  yesNotFieldTpl: TemplateRef<any>;
  @ViewChild('dateFieldTpl', { static: true })
  dateFieldTpl: TemplateRef<any>;
  @ViewChild('towerFieldTpl', { static: true })
  towerFieldTpl: TemplateRef<any>;
  @ViewChild('islandFieldTpl', { static: true })
  islandFieldTpl: TemplateRef<any>;
  @ViewChild('subislandFieldTpl', { static: true })
  subislandFieldTpl: TemplateRef<any>;
  @ViewChild('subjectFieldTpl', { static: true })
  subjectFieldTpl: TemplateRef<any>;
  @ViewChild('negotiationTypeFieldTpl', { static: true })
  negotiationTypeFieldTpl: TemplateRef<any>;
  @ViewChild('legacyFieldTpl', { static: true })
  legacyFieldTpl: TemplateRef<any>;

  private _fieldConfigMap = new Map<
    keyof ProtocolModelLike | keyof ProtocolDetailsModelLike,
    FieldCfgLike
  >([
    // #region Manual Fields
    [
      'analyst',
      {
        length: 30,
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'activityId',
      {
        template: (x) => x.subislandFieldTpl,
      },
    ],
    [
      'quotation',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'amendmentContractDate',
      {
        template: (x) => x.dateFieldTpl,
      },
    ],
    [
      'returnDate',
      {
        template: (x) => x.dateFieldTpl,
      },
    ],
    [
      'smpDate',
      {
        template: (x) => x.dateFieldTpl,
      },
    ],
    [
      'forwardedRenegotiation',
      {
        template: (x) => x.yesNotFieldTpl,
      },
    ],
    [
      'exception',
      {
        length: 50,
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'exceptionReason',
      {
        length: 50,
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'salesOrder',
      {
        length: 50,
        template: (x) => x.numericFieldTpl,
      },
    ],
    [
      'offender',
      {
        length: 30,
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'order',
      {
        length: 50,
        template: (x) => x.numericFieldTpl,
      },
    ],
    [
      'portabilityTransfer',
      {
        template: (x) => x.yesNotFieldTpl,
      },
    ],
    [
      'deviceQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'qty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'linesQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'licensesQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'complaint',
      {
        length: 50,
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'revision',
      {
        transform: Number,
        length: 10,
        template: (x) => x.numericFieldTpl,
      },
    ],
    [
      'sfa',
      {
        template: (x) => x.numericFieldTpl,
      },
    ],
    [
      'requestDepApple',
      {
        template: (x) => x.yesNotFieldTpl,
      },
    ],
    [
      'requestDifferentAddressDelivery',
      {
        template: (x) => x.yesNotFieldTpl,
      },
    ],
    [
      'requester',
      {
        length: 30,
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'atlasQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'backupQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'fixedQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'm2mQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'terminalsQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'penQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'migrationQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'portabilityQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'prePostQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'exchangesQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'ttQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'nSimplify',
      {
        length: 30,
        template: (x) => x.numericFieldTpl,
      },
    ],
    [
      'contractType',
      {
        length: 30,
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'failureType',
      {
        length: 30,
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'documentType',
      {
        length: 30,
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'totalVolume',
      {
        transform: Number,
        length: 10,
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'amountInvolved',
      {
        transform: Number,
        template: (x) => x.currencyFieldTpl,
      },
    ],
    [
      'vmn',
      {
        transform: Number,
        length: 30,
        template: (x) => x.numberFieldTpl,
      },
    ],
    // #endregion

    // #region Automatic Fields
    [
      'towerId',
      {
        template: (x) => x.towerFieldTpl,
      },
    ],
    [
      'islandId',
      {
        template: (x) => x.islandFieldTpl,
      },
    ],
    [
      'subislandId',
      {
        template: (x) => x.subislandFieldTpl,
      },
    ],
    [
      'legacyId',
      {
        template: (x) => x.legacyFieldTpl,
      },
    ],
    [
      'microStep',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'stepDate',
      {
        template: (x) => x.dateFieldTpl,
      },
    ],
    [
      'lastUpdateDate',
      {
        template: (x) => x.dateFieldTpl,
      },
    ],
    [
      'nSfa',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'nSimulation',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'nComposition',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'nQuotation',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'nPrincipalQuotation',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'nOrder',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'nInfoB2b',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'subjectId',
      {
        template: (x) => x.subjectFieldTpl,
      },
    ],
    [
      'flow',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'service',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'row',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'infoB2bReason',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'statusRequest',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'substatusRequest',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'statusRequestDate',
      {
        template: (x) => x.dateFieldTpl,
      },
    ],
    [
      'activityType',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'activityStatus',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'activityName',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'activityComment',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'productDescription',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'productType',
      {
        template: (x) => x.textFieldTpl,
      },
    ],
    [
      'productQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'erroLinesQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'swapQty',
      {
        template: (x) => x.numberFieldTpl,
      },
    ],
    [
      'negotiationTypeId',
      {
        template: (x) => x.negotiationTypeFieldTpl,
      },
    ],
    // #endregion
  ]);

  workHasStarted = false;

  private fecthProtocolRoutineSubscription: Subscription;

  private timer = new RxCountTimer();
  timeSpendObservable = this.timer.events.pipe(
    map((x) => x.time),
    startWith(0),
    map((x) => {
      return TimeSpan.fromMilliseconds(x);
    })
  );

  userName: string;
  protocolsMetCount = 0;
  protocolsRunningCount = 0;
  protocolStatus = 'Em Tratativa';

  protocolInfosVisible = false;
  treatmentStep: TreatmentStepModel;

  protocolFormGroup: FormGroup<ProtocolFormLike>;

  get f() {
    return this.protocolFormGroup.controls;
  }
  get fAutomatic() {
    return this.f.automatic.controls;
  }
  get fManual() {
    return this.f.manual.controls;
  }

  submitted = false;

  segmentDataSource = this.segmentService.list();
  towerDataSource = this.towersService.list();
  islandDataSource = this.islandsService.list();
  subislandDataSource = this.subislandsService.list();
  subjectDataSource = this.subjectsService.list();
  negotiationTypeDataSource = this.negotiationTypesService.list();
  legacyDataSource = this.legaciesService.list();
  yesNotDataSource: OptionModelLike<boolean>[] = [
    {
      label: this.translateService.instant('defaults.yes'),
      value: true,
    },
    {
      label: this.translateService.instant('defaults.not'),
      value: false,
    },
  ];

  protocolActionDataSource = null;
  dealingReasonDataSource = this.dealingReasonService.list();
  dealingSubreasonDataSource: CustomRawDataSource<DealingSubreasonModel>;
  dealingSubreason2DataSource: CustomRawDataSource<DealingSubreason2Model>;

  dynamicAutomaticFields: ProtocolFieldDealingModel[];
  dynamicManualFields: ProtocolFieldDealingModel[];
  private _formAutomaticControlDynamicMap = new Map<string, FormControl>();
  private _formManualControlDynamicMap = new Map<string, FormControl>();

  constructor(
    private formBuilder: FormBuilder,
    private treatmentService: TreatmentService,
    private protocolService: ProtocolsService,
    private segmentService: SegmentsService,
    private towersService: TowersService,
    private islandsService: IslandsService,
    private subislandsService: SubislandsService,
    private subjectsService: SubjectsService,
    private negotiationTypesService: NegotiationTypesService,
    private legaciesService: LegaciesService,
    private protocolActionsService: ProtocolActionsService,
    private dealingReasonService: DealingReasonsService,
    private dealingSubreasonService: DealingSubreasonsService,
    private dealingSubreason2Service: DealingSubreason2Service,
    private modalService: NgbModal,
    private confirmsDialog: ConfirmsDialog,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController,
    private translateService: TranslateService
  ) {
    this.protocolFormGroup = this.formBuilder.group<ProtocolFormLike>({
      automatic: this.formBuilder.group<ProtocolInfoFormLike>({
        id: this.formBuilder.control<number>(null),
        number: this.formBuilder.control<string>(null),
        customer: this.formBuilder.control<string>(null),
        document: this.formBuilder.control<string>(null),
        segmentId: this.formBuilder.control<number>(null),
        stepLegacy: this.formBuilder.control<string>(null),
        createdAt: this.formBuilder.control<Date>(null),
        dynamicFields: this.formBuilder.group({}),
      }),
      manual: this.formBuilder.group<ProtocolActionFormLike>({
        dynamicFields: this.formBuilder.group({}, [Validators.required]),
        actionId: this.formBuilder.control<number>(null, [Validators.required]),
        reason: this.formBuilder.control<number>(null, [Validators.required]),
        subreason: this.formBuilder.control<number>(null, [
          Validators.required,
        ]),
        subreason2: this.formBuilder.control<number>(null, [
          Validators.required,
        ]),
        observation: this.formBuilder.control<string>(null),
      }),
    });

    this.f.automatic.disable();
  }

  ngOnInit(): void {
    this.dealingSubreasonDataSource =
      new CustomRawDataSource<DealingSubreasonModel>({
        load: () => {
          const value = this.fManual.reason.getRawValue();
          if (!value) {
            return [];
          }

          return this.dealingSubreasonService.listByDealingReasons([value]);
        },
      });
    this.dealingSubreason2DataSource =
      new CustomRawDataSource<DealingSubreason2Model>({
        load: () => {
          const value = this.fManual.subreason.getRawValue();
          if (!value) {
            return [];
          }

          return this.dealingSubreason2Service.listByDealingSubreasons([value]);
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
        parentControl: this.fManual.reason,
        children: [
          {
            control: this.fManual.subreason,
            dataSource: this.dealingSubreasonDataSource,
          },
        ],
      },
      {
        parentControl: this.fManual.subreason,
        children: [
          {
            control: this.fManual.subreason2,
            dataSource: this.dealingSubreason2DataSource,
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

    this.loadWorkInfo();
    this.loadPausedTreatmentsCount();

    this.setupFetchProtocolRoutine();
  }

  ngOnDestroy(): void {
    this.timer?.destroy();

    this.dealingSubreasonDataSource?.dispose();
    this.dealingSubreason2DataSource?.dispose();
  }

  onSubmit() {
    if (this.globalLoadingController.isShown() || !this.isInTreatment()) {
      return;
    }

    this.submitted = true;
    if (this.protocolFormGroup.invalid) {
      return;
    }

    const details: any = {};

    this.dynamicManualFields.forEach((field) => {
      const name = field.name;
      const control = this._formManualControlDynamicMap.get(name);
      let value = control.getRawValue();
      value = this.getFormControlTransform(name)?.(value) ?? value;

      if (typeof value === 'number') {
        value = Math.min(
          value,
          this.calculateFormControlMaxNumber(this.getFormControlLength(name))
        );
      }

      details[name] = value;
    });

    const { actionId, reason, subreason, subreason2, observation } =
      this.f.manual.getRawValue();

    this.globalLoadingController.show();
    this.treatmentService
      .finishTreatment(this.treatmentStep.id, {
        actionId,
        reasonConclusionId: reason,
        subreasonConclusionId: subreason,
        subreason2ConclusionId: subreason2,
        observationConclusion: observation,
        details,
      })
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'protocol-dealings.messages.treatment-finished'
          );

          this._onAfterFinishProtocol();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `protocol-dealings.errors.cannot-finish-treatment`
          );
        },
      });
  }

  onBtnStartWorkClick() {
    if (this.workHasStarted) {
      return;
    }

    this.globalLoadingController.show();
    this.treatmentService
      .startWork()
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.workHasStarted = true;
        },
        error: (response) => {
          if (!response) {
            return;
          }
        },
      });
  }

  onBtnRequestFinishWorkClick() {
    if (!this.workHasStarted || this.modalService.hasOpenModals()) {
      return;
    }

    const modalRef = this.modalService.open(FinishWorkModalComponent, {
      size: 'lg',
    });

    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.workHasStarted = false;

        this.fecthProtocolRoutineSubscription?.unsubscribe();
      });
  }

  onBtnVerifyClick() {
    this._openPausedProtocolsModal();
  }

  onBtnRequestPauseProtocolClick() {
    if (this.modalService.hasOpenModals()) {
      return;
    }

    const modalRef = this.modalService.open(PauseProtocolModalComponent, {
      size: 'xs',
    });
    (
      modalRef.componentInstance as PauseProtocolModalComponent
    ).treatmentStepId = this.treatmentStep.id;

    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this._onAfterPauseProtocol();
      });
  }

  onBtnPlayProtocolClick() {
    if (this.globalLoadingController.isShown() || !this.isTreatmentPaused()) {
      return;
    }

    this.globalLoadingController.show();
    this.treatmentService
      .playTreatment(this.treatmentStep.id)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'protocol-dealings.messages.protocol-played'
          );

          this._onAfterPlayProtocol();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `protocol-dealings.errors.cannot-play-protocol`
          );
        },
      });
  }

  _onInputNumberChange(control: FormControl, name: string) {
    const max = this.calculateFormControlMaxNumber(
      this.getFormControlLength(name)
    );

    const value = Math.min(control.getRawValue(), max);
    control.patchValue(value);
  }

  getFormControl(name: string, manual: boolean) {
    return manual
      ? this._formManualControlDynamicMap.get(name)
      : this._formAutomaticControlDynamicMap.get(name);
  }

  getFormControlTransform(name: string) {
    return this._fieldConfigMap.get(name as any)?.transform;
  }

  getFormControlLength(name: string) {
    return this._fieldConfigMap.get(name as any)?.length ?? 10;
  }

  calculateFormControlMaxNumber(length: number) {
    length ??= 10;

    let max: number;
    if (numberMaxLengthCache.has(length)) {
      max = numberMaxLengthCache.get(length);
    } else {
      max = Number(`9`.repeat(length));
      numberMaxLengthCache.set(length, max);
    }

    return max;
  }

  getFormControlTemplate(name: string) {
    return (
      this._fieldConfigMap.get(name as any)?.template?.(this) ??
      this.textFieldTpl
    );
  }

  isInTreatment() {
    return this.treatmentStep?.status === TreatmentStepStatus.InTreatment;
  }

  isTreatmentPaused() {
    return this.treatmentStep?.status === TreatmentStepStatus.Paused;
  }

  private loadWorkInfo() {
    this.globalLoadingController.show();
    this.treatmentService
      .getWorkInfo()
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (info) => {
          this.workHasStarted = info?.workStatus === WorkStatusOption.Acting;

          this.userName = info?.name;
          this.protocolsMetCount = info?.treatmentsDoneCount ?? 0;
        },
        error: (response) => {
          if (!response) {
            return;
          }
        },
      });
  }

  private loadPausedTreatmentsCount(callback?: (count: number) => void) {
    this.globalLoadingController.show();
    this.treatmentService
      .countPausedProtocols()
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (count) => {
          this.protocolsRunningCount = count;

          callback?.(count);
        },
      });
  }

  private setupFetchProtocolRoutine(loadingMode = false) {
    this.fecthProtocolRoutineSubscription?.unsubscribe();

    let firstRequest = true;

    this.globalLoadingController.show();
    this.fecthProtocolRoutineSubscription = this.treatmentService
      .getCurrentTreatment()
      .pipe(
        repeat({
          delay: 5000,
        }),
        finalize(() => {
          if (loadingMode || firstRequest) {
            this.globalLoadingController.hide();
          }
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (step) => {
          if (!loadingMode && firstRequest) {
            this.globalLoadingController.hide();
          }
          firstRequest = false;

          const protocol = step?.protocol;
          const shouldClearData = this.treatmentStep?.id !== step?.id;

          if (shouldClearData) {
            this.clearProtocolInfos();
          }

          if (protocol) {
            this.fecthProtocolRoutineSubscription?.unsubscribe();

            this.treatmentStep = step;

            this.handleTreatmentStatus();
            this.loadAction(protocol.id);

            const updateFormFn = () => {
              const aux: any = {
                ...(protocol as any),
                dynamicFields: {
                  ...(protocol.details as any),
                  ...(protocol as any),
                },
              };

              this.protocolFormGroup.reset({
                automatic: aux,
                manual: aux,
              });
            };

            if (shouldClearData) {
              this.loadProtocolFields(
                this.treatmentStep.protocolId,
                updateFormFn
              );
            } else {
              updateFormFn();
            }

            this.timer.reset({
              startTime: step.treatmentTimeSpend?.totalMilliseconds ?? 0,
            });
            if (this.isInTreatment()) {
              this.timer.start();
            }
          }

          this.protocolInfosVisible = !!protocol;
        },
      });
  }

  private _onAfterPlayProtocol() {
    this.submitted = false;
    this.loadWorkInfo();
    this.loadPausedTreatmentsCount();
    this.setupFetchProtocolRoutine(true);
  }

  private _onAfterPauseProtocol() {
    this.submitted = false;
    this.loadWorkInfo();
    this.loadPausedTreatmentsCount();
    this.setupFetchProtocolRoutine();
  }

  private _onAfterFinishProtocol() {
    this.submitted = false;
    this.loadWorkInfo();
    this.clearProtocolInfos();
    this.loadPausedTreatmentsCount((count) => {
      if (count > 0) {
        this.confirmsDialog
          .open(
            'protocol-dealings.dialogs.paused-protocols-warning.title',
            'protocol-dealings.dialogs.paused-protocols-warning.message'
          )
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this._openPausedProtocolsModal();
            },
            error: () => {
              this.setupFetchProtocolRoutine();
            },
          });
      } else {
        this.setupFetchProtocolRoutine();
      }
    });
  }

  private _openPausedProtocolsModal() {
    if (this.modalService.hasOpenModals()) {
      return;
    }

    const modalRef = this.modalService.open(DealingProtocolsModalComponent, {
      size: 'xxl',
    });
    (
      modalRef.componentInstance as DealingProtocolsModalComponent
    ).playButtonEnabled = !this.isTreatmentPaused();

    from(modalRef.result)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this._onAfterPlayProtocol();
        },
        error: () => {
          if (!this.isInTreatment() && !this.isTreatmentPaused()) {
            this.setupFetchProtocolRoutine();
          }
        },
      });
  }

  private loadProtocolFields(protocolId: number, callback?: () => void) {
    this.globalLoadingController.show();
    this.protocolService
      .listFieldsDealingByProtocolId(protocolId)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();

          callback?.();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (list) => {
          this.clearDynamicFields();

          [this.fManual.dynamicFields, this.fAutomatic.dynamicFields].forEach(
            (group) => {
              const controlNames = Object.keys(group.controls);
              controlNames.forEach((control) => {
                group.removeControl(control);
              });
            }
          );

          list.forEach((field) => {
            const control = this.formBuilder.control(
              null,
              !field.required || !field.isManual ? [] : [Validators.required]
            );

            const length = this.getFormControlLength(field.name);
            if (length) {
              control.addValidators(Validators.maxLength(length));
            }

            if (field.isManual) {
              this.fManual.dynamicFields.addControl(field.name, control);
              this.dynamicManualFields.push(field);
              this._formManualControlDynamicMap.set(field.name, control);
            } else {
              control.disable();
              this.fAutomatic.dynamicFields.addControl(field.name, control);
              this.dynamicAutomaticFields.push(field);
              this._formAutomaticControlDynamicMap.set(field.name, control);
            }
          });
        },
      });
  }

  private clearProtocolInfos() {
    this.submitted = false;
    this.protocolInfosVisible = false;
    this.treatmentStep = null;
    this.protocolStatus = null;
    this.protocolFormGroup.reset();
    this.timer.clear();

    this.clearDynamicFields();
  }

  private clearDynamicFields() {
    this.submitted = false;
    this.dynamicAutomaticFields = [];
    this.dynamicManualFields = [];
    this._formAutomaticControlDynamicMap.clear();
    this._formManualControlDynamicMap.clear();
  }

  private handleTreatmentStatus() {
    let text = '';

    switch (this.treatmentStep?.status) {
      case TreatmentStepStatus.InTreatment:
        text = this.translateService.instant('treatment-status.in-treatment');
        break;
      case TreatmentStepStatus.Paused:
        text = this.translateService.instant('treatment-status.paused');
        break;
      case TreatmentStepStatus.Done:
        text = this.translateService.instant('treatment-status.done');
        break;
    }

    this.protocolStatus = text;
  }

  private loadAction(protocolId: number){
    this.protocolActionDataSource = this.protocolActionsService.listByFlow(protocolId);
  }
}
