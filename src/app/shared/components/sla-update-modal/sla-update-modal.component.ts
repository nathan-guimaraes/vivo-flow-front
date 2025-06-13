import {
  Component,
  DestroyRef,
  Inject,
  Input,
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
import { SlaService } from '../../services/sla.service';
import { SlaModelLike, SlaTimeType } from '../../models/sla.model';
import { OptionModelLike } from '../../models/option.model';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';

interface SlaFormLike {
  time: FormControl<number>;
  type: FormControl<SlaTimeType>;
}

@Component({
  selector: 'app-sla-update-modal',
  templateUrl: 'sla-update-modal.component.html',
  styleUrls: ['sla-update-modal.component.scss'],
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
export class SlaUpdateModalComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  @Input({ required: true })
  model: SlaModelLike;

  formGroup: FormGroup<SlaFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  submitted: boolean;

  typesDataSource: OptionModelLike<SlaTimeType>[] = [
    {
      value: SlaTimeType.Hours,
      label: this.translateService.instant('sla.types.hours'),
    },
    {
      value: SlaTimeType.Days,
      label: this.translateService.instant('sla.types.days'),
    },
    {
      value: SlaTimeType.BusinessHours,
      label: this.translateService.instant('sla.types.business-hours'),
    },
    {
      value: SlaTimeType.BusinessDays,
      label: this.translateService.instant('sla.types.business-days'),
    },
  ];

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private slaService: SlaService,
    private translateService: TranslateService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<SlaFormLike>({
      time: this.formBuilder.control<number>(null, [Validators.required]),
      type: this.formBuilder.control<number>(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.formGroup.reset(this.model);
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
    this.slaService
      .update(this.model.id, values)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(`sla-update-modal.messages.sla-updated`);
          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(`sla-update-modal.errors.cannot-save-sla`);
        },
      });
  }
}
