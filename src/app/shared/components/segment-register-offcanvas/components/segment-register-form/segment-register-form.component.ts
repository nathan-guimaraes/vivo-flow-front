import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Output,
  inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FieldModule } from '../../../field/field.module';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastService } from 'src/app/shared/services/toast.service';
import { LoadingController } from 'src/app/shared/helpers/loading.controller';
import { GLOBAL_LOADING } from 'src/app/shared/constants/loading-controller.constant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { SegmentsService } from 'src/app/shared/services/segments.service';

interface SegmentFormLike {
  name: FormControl<string>;
}

@Component({
  selector: 'app-segment-register-form',
  templateUrl: 'segment-register-form.component.html',
  styleUrls: ['segment-register-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, FieldModule],
})
export class SegmentRegisterFormComponent {
  private destroyRef = inject(DestroyRef);

  @Output()
  readonly onSaved = new EventEmitter<void>();
  @Output()
  readonly onCanceled = new EventEmitter<void>();

  formGroup: FormGroup<SegmentFormLike> =
    this.formBuilder.group<SegmentFormLike>({
      name: this.formBuilder.control<string>(null, [Validators.required]),
    });

  get f() {
    return this.formGroup.controls;
  }

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private segmentsService: SegmentsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  onSubmit() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.submitted = true;
    if (this.formGroup.invalid) {
      return;
    }

    const { name } = this.formGroup.getRawValue();

    this.globalLoadingController.show();
    this.segmentsService
      .create(name)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `segment-register-form.messages.segment-saved`
          );

          this.onSaved.emit();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `segment-register-form.errors.cannot-save-segment`
          );
        },
      });
  }
}
