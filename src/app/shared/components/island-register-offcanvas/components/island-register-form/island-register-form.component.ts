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
import { SelectBoxModule } from '../../../select-box/select-box.module';
import { IslandsService } from 'src/app/shared/services/islands.service';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface IslandFormLike {
  name: FormControl<string>;
  towerId: FormControl<number>;
}

@Component({
  selector: 'app-island-register-form',
  templateUrl: 'island-register-form.component.html',
  styleUrls: ['island-register-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FieldModule,
    SelectBoxModule,
  ],
})
export class IslandRegisterFormComponent {
  private destroyRef = inject(DestroyRef);

  @Output()
  readonly onSaved = new EventEmitter<void>();
  @Output()
  readonly onCanceled = new EventEmitter<void>();

  formGroup: FormGroup<IslandFormLike> = this.formBuilder.group<IslandFormLike>(
    {
      name: this.formBuilder.control<string>(null, [Validators.required]),
      towerId: this.formBuilder.control<number>(null, [Validators.required]),
    }
  );

  get f() {
    return this.formGroup.controls;
  }

  submitted = false;

  towerDataSource = this.towersService.list();

  constructor(
    private formBuilder: FormBuilder,
    private islandsService: IslandsService,
    private towersService: TowersService,
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

    const values = this.formGroup.getRawValue();

    this.globalLoadingController.show();
    this.islandsService
      .create(values)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `island-register-form.messages.island-saved`
          );

          this.onSaved.emit();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `island-register-form.errors.cannot-save-island`
          );
        },
      });
  }
}
