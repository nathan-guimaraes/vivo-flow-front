import {
  Component,
  DestroyRef,
  Inject,
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
} from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { FieldModule } from '../field/field.module';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { TreatmentService } from '../../services/treatment.service';
import { FinishWorkReasonService } from '../../services/finish-work-reason.service';

interface FinishWorkFormLike {
  reason: FormControl<number>;
}

@Component({
  selector: 'app-finish-work-modal',
  templateUrl: 'finish-work-modal.component.html',
  styleUrls: ['finish-work-modal.component.scss'],
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
export class FinishWorkModalComponent {
  private destroyRef = inject(DestroyRef);

  formGroup: FormGroup<FinishWorkFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  reasonDataSource = this.finishWorkReasonService.list();

  submitted: boolean;

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private finishWorkReasonService: FinishWorkReasonService,
    private treatmentService: TreatmentService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<FinishWorkFormLike>({
      reason: this.formBuilder.control<number>(null, [Validators.required]),
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
      .finishWork(reason)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }
        },
      });
  }
}
