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
import { LegaciesService } from 'src/app/shared/services/legacies.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

interface LegacyFormLike {
  name: FormControl<string>;
}

@Component({
  selector: 'app-legacy-register-form',
  templateUrl: 'legacy-register-form.component.html',
  styleUrls: ['legacy-register-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, FieldModule],
})
export class LegacyRegisterFormComponent {
  private destroyRef = inject(DestroyRef);

  @Output()
  readonly onSaved = new EventEmitter<void>();
  @Output()
  readonly onCanceled = new EventEmitter<void>();

  formGroup: FormGroup<LegacyFormLike> = this.formBuilder.group<LegacyFormLike>(
    {
      name: this.formBuilder.control<string>(null, [Validators.required]),
    }
  );

  get f() {
    return this.formGroup.controls;
  }

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private legaciesService: LegaciesService,
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
    this.legaciesService
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
            `legacy-register-form.messages.legacy-saved`
          );

          this.onSaved.emit();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `legacy-register-form.errors.cannot-save-legacy`
          );
        },
      });
  }
}
