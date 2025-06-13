import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
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
import { finalize, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DealingSubreasonsService } from 'src/app/shared/services/dealing-subreasons.service';
import { CustomRawDataSource } from 'src/app/shared/helpers/datasources/custom-raw-datasource';
import { DealingReasonModel } from 'src/app/shared/models/dealing-reason.model';
import { DealingReasonsService } from 'src/app/shared/services/dealing-reasons.service';

interface DealingSubreasonFormLike {
  name: FormControl<string>;
  towerId: FormControl<number>;
  dealingReasonId: FormControl<number>;
}

@Component({
  selector: 'app-dealing-subreason-register-form',
  templateUrl: 'dealing-subreason-register-form.component.html',
  styleUrls: ['dealing-subreason-register-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FieldModule,
    SelectBoxModule,
  ],
})
export class DealingSubreasonRegisterFormComponent
  implements OnInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  @Output()
  readonly onSaved = new EventEmitter<void>();
  @Output()
  readonly onCanceled = new EventEmitter<void>();

  formGroup: FormGroup<DealingSubreasonFormLike> =
    this.formBuilder.group<DealingSubreasonFormLike>({
      name: this.formBuilder.control<string>(null, [Validators.required]),
      towerId: this.formBuilder.control<number>(null, [Validators.required]),
      dealingReasonId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
    });

  get f() {
    return this.formGroup.controls;
  }

  submitted = false;

  towerDataSource = this.towersService.list();
  dealingReasonDataSource: CustomRawDataSource<DealingReasonModel>;

  constructor(
    private formBuilder: FormBuilder,
    private dealingSubreasonsService: DealingSubreasonsService,
    private dealingReasonsService: DealingReasonsService,
    private towersService: TowersService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.dealingReasonDataSource = new CustomRawDataSource<DealingReasonModel>({
      load: () => {
        const value = this.f.towerId.getRawValue();
        if (!value) {
          return [];
        }

        return this.dealingReasonsService.listByTowers([value]);
      },
    });

    this.f.towerId.valueChanges
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const formControl = this.f.dealingReasonId;
        formControl.reset();
        if (value) {
          formControl.enable();
        } else {
          formControl.disable();
        }

        this.dealingReasonDataSource.clearRawData();
        this.dealingReasonDataSource.reload();
      });
  }

  ngOnDestroy(): void {
    this.dealingReasonDataSource?.dispose();
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
    this.dealingSubreasonsService
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
            `dealing-subreason-form.messages.dealing-subreason-saved`
          );

          this.onSaved.emit();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `dealing-subreason-form.errors.cannot-save-dealing-subreason`
          );
        },
      });
  }
}
