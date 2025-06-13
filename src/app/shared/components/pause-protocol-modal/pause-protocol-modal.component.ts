import { Component, DestroyRef, Inject, Input, inject } from '@angular/core';
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
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { UsersService } from '../../services/users.service';
import { FieldModule } from '../field/field.module';
import { CommonModule } from '@angular/common';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { TreatmentPauseReasonType } from '../../models/treatment-pause-reason.model';
import { OptionModelLike } from '../../models/option.model';
import { treatmentPauseReasonMap } from '../../constants/treatments.constant';
import { TreatmentService } from '../../services/treatment.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface PauseProtocolFormLike {
  reason: FormControl<TreatmentPauseReasonType>;
}

@Component({
  selector: 'app-pause-protocol-modal',
  templateUrl: 'pause-protocol-modal.component.html',
  styleUrls: ['pause-protocol-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModalModule,
    ModalTemplateComponent,
    FieldModule,
    SelectBoxModule,
    IconicModule,
  ],
})
export class PauseProtocolModalComponent {
  private destroyRef = inject(DestroyRef);

  @Input({ required: true })
  treatmentStepId: number;

  formGroup: FormGroup<PauseProtocolFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  pauseTypesDataSource: OptionModelLike<TreatmentPauseReasonType>[] =
    Object.keys(TreatmentPauseReasonType)
      .filter((key) => {
        return Number.isNaN(Number(key));
      })
      .map((key) => {
        return TreatmentPauseReasonType[key];
      })
      .map((value: any) => {
        const label = treatmentPauseReasonMap.get(value) ?? value;
        return {
          value,
          label,
        };
      });

  submitted: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private treatmentService: TreatmentService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<PauseProtocolFormLike>({
      reason: this.formBuilder.control<TreatmentPauseReasonType>(null, [
        Validators.required,
      ]),
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

    const { reason } = this.formGroup.getRawValue();

    this.globalLoadingController.show();
    this.treatmentService
      .pauseTreatment(this.treatmentStepId, reason)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'pause-protocol-modal.messages.protocol-paused'
          );

          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `pause-protocol-modal.errors.cannot-pause-protocol`
          );
        },
      });
  }
}
