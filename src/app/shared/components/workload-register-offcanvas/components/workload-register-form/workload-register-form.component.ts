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
import { TowersService } from 'src/app/shared/services/towers.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { WorkloadsService } from 'src/app/shared/services/workloads.service';

interface WorkloadFormLike {
  name: FormControl<string>;
}

@Component({
  selector: 'app-workload-register-form',
  templateUrl: 'workload-register-form.component.html',
  styleUrls: ['workload-register-form.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, FieldModule],
})
export class WorkloadRegisterFormComponent {
  private destroyRef = inject(DestroyRef);

  @Output()
  readonly onSaved = new EventEmitter<void>();
  @Output()
  readonly onCanceled = new EventEmitter<void>();

  formGroup: FormGroup<WorkloadFormLike> =
    this.formBuilder.group<WorkloadFormLike>({
      name: this.formBuilder.control<string>(null, [Validators.required]),
    });

  get f() {
    return this.formGroup.controls;
  }

  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private workloadsService: WorkloadsService,
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
    this.workloadsService
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
            `workload-register-form.messages.workload-saved`
          );

          this.onSaved.emit();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `workload-register-form.errors.cannot-save-workload`
          );
        },
      });
  }
}
