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
import { DealingSubreasonModel } from 'src/app/shared/models/dealing-subreason.model';
import { DealingSubreason2Service } from 'src/app/shared/services/dealing-subreason2.service';
import { CustomDataSource } from 'src/app/shared/helpers/datasources/custom-datasource';

interface DealingSubreason2FormLike {
  name: FormControl<string>;
  towerId: FormControl<number>;
  dealingReasonId: FormControl<number>;
  dealingSubreasonId: FormControl<number>;
}

@Component({
  selector: 'app-dealing-subreason2-register-form',
  templateUrl: 'dealing-subreason2-register-form.component.html',
  styleUrls: ['dealing-subreason2-register-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FieldModule,
    SelectBoxModule,
  ],
})
export class DealingSubreason2RegisterFormComponent
  implements OnInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  @Output()
  readonly onSaved = new EventEmitter<void>();
  @Output()
  readonly onCanceled = new EventEmitter<void>();

  formGroup: FormGroup<DealingSubreason2FormLike> =
    this.formBuilder.group<DealingSubreason2FormLike>({
      name: this.formBuilder.control<string>(null, [Validators.required]),
      towerId: this.formBuilder.control<number>(null, [Validators.required]),
      dealingReasonId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
      dealingSubreasonId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
    });

  get f() {
    return this.formGroup.controls;
  }

  submitted = false;

  towerDataSource = this.towersService.list();
  dealingReasonDataSource: CustomRawDataSource<DealingReasonModel>;
  dealingSubreasonDataSource: CustomRawDataSource<DealingSubreasonModel>;

  constructor(
    private formBuilder: FormBuilder,
    private dealingSubreason2Service: DealingSubreason2Service,
    private dealingReasonsService: DealingReasonsService,
    private dealingSubreasonsService: DealingSubreasonsService,
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
    this.dealingSubreasonDataSource =
      new CustomRawDataSource<DealingSubreasonModel>({
        load: () => {
          const value = this.f.dealingReasonId.getRawValue();
          if (!value) {
            return [];
          }

          return this.dealingSubreasonsService.listByDealingReasons([value]);
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
        parentControl: this.f.towerId,
        children: [
          {
            control: this.f.dealingReasonId,
            dataSource: this.dealingReasonDataSource,
          },
        ],
      },
      {
        parentControl: this.f.dealingReasonId,
        children: [
          {
            control: this.f.dealingSubreasonId,
            dataSource: this.dealingSubreasonDataSource,
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
  }

  ngOnDestroy(): void {
    this.dealingReasonDataSource?.dispose();
    this.dealingSubreasonDataSource?.dispose();
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
    this.dealingSubreason2Service
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
            `dealing-subreason2-form.messages.dealing-subreason2-saved`
          );

          this.onSaved.emit();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg ||
              `dealing-subreason2-form.errors.cannot-save-dealing-subreason`
          );
        },
      });
  }
}
