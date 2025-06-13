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
import { IslandsService } from 'src/app/shared/services/islands.service';
import { SubislandsService } from 'src/app/shared/services/subislands.service';
import { finalize, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IslandModel } from 'src/app/shared/models/island.model';
import { CustomRawDataSource } from 'src/app/shared/helpers/datasources/custom-raw-datasource';

interface SubislandFormLike {
  name: FormControl<string>;
  towerId: FormControl<number>;
  islandId: FormControl<number>;
}

@Component({
  selector: 'app-subisland-register-form',
  templateUrl: 'subisland-register-form.component.html',
  styleUrls: ['subisland-register-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FieldModule,
    SelectBoxModule,
  ],
})
export class SubislandRegisterFormComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  @Output()
  readonly onSaved = new EventEmitter<void>();
  @Output()
  readonly onCanceled = new EventEmitter<void>();

  formGroup: FormGroup<SubislandFormLike> =
    this.formBuilder.group<SubislandFormLike>({
      name: this.formBuilder.control<string>(null, [Validators.required]),
      towerId: this.formBuilder.control<number>(null, [Validators.required]),
      islandId: this.formBuilder.control<number>(null, [Validators.required]),
    });

  get f() {
    return this.formGroup.controls;
  }

  submitted = false;

  towerDataSource = this.towersService.list();
  islandDataSource: CustomRawDataSource<IslandModel>;

  constructor(
    private formBuilder: FormBuilder,
    private subislandsService: SubislandsService,
    private towersService: TowersService,
    private islandsService: IslandsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.islandDataSource = new CustomRawDataSource<IslandModel>({
      load: () => {
        const value = this.f.towerId.getRawValue();
        if (!value) {
          return [];
        }

        return this.islandsService.listByTowers([value]);
      },
    });

    this.f.towerId.valueChanges
      .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        const formControl = this.f.islandId;
        formControl.reset();
        if (value) {
          formControl.enable();
        } else {
          formControl.disable();
        }

        this.islandDataSource.clearRawData();
        this.islandDataSource.reload();
      });
  }

  ngOnDestroy(): void {
    this.islandDataSource?.dispose();
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
    this.subislandsService
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
            `subisland-register-form.messages.subisland-saved`
          );

          this.onSaved.emit();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `subisland-register-form.errors.cannot-save-subisland`
          );
        },
      });
  }
}
