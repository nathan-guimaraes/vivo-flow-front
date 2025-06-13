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
import { SubjectsService } from 'src/app/shared/services/subjects.service';
import { finalize, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CustomRawDataSource } from 'src/app/shared/helpers/datasources/custom-raw-datasource';
import { SubislandModel } from 'src/app/shared/models/subisland.model';
import { IslandModel } from 'src/app/shared/models/island.model';
import { CustomDataSource } from 'src/app/shared/helpers/datasources/custom-datasource';

interface SubjectFormLike {
  name: FormControl<string>;
  towerId: FormControl<number>;
  islandId: FormControl<number>;
  subislandId: FormControl<number>;
}

@Component({
  selector: 'app-subject-register-form',
  templateUrl: 'subject-register-form.component.html',
  styleUrls: ['subject-register-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FieldModule,
    SelectBoxModule,
  ],
})
export class SubjectRegisterFormComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  @Output()
  readonly onSaved = new EventEmitter<void>();
  @Output()
  readonly onCanceled = new EventEmitter<void>();

  formGroup: FormGroup<SubjectFormLike> =
    this.formBuilder.group<SubjectFormLike>({
      name: this.formBuilder.control<string>(null, [Validators.required]),
      towerId: this.formBuilder.control<number>(null, [Validators.required]),
      islandId: this.formBuilder.control<number>(null, [Validators.required]),
      subislandId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
    });

  get f() {
    return this.formGroup.controls;
  }

  submitted = false;

  towerDataSource = this.towersService.list();
  islandDataSource: CustomRawDataSource<IslandModel>;
  subislandDataSource: CustomRawDataSource<SubislandModel>;

  constructor(
    private formBuilder: FormBuilder,
    private subjectsService: SubjectsService,
    private towersService: TowersService,
    private islandsService: IslandsService,
    private subislandsService: SubislandsService,
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
    this.subislandDataSource = new CustomRawDataSource<SubislandModel>({
      load: () => {
        const value = this.f.islandId.getRawValue();
        if (!value) {
          return [];
        }

        return this.subislandsService.listByIslands([value]);
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
            control: this.f.islandId,
            dataSource: this.islandDataSource,
          },
        ],
      },
      {
        parentControl: this.f.islandId,
        children: [
          {
            control: this.f.subislandId,
            dataSource: this.subislandDataSource,
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
    this.islandDataSource?.dispose();
    this.subislandDataSource?.dispose();
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
    this.subjectsService
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
            `subject-register-form.messages.subject-saved`
          );

          this.onSaved.emit();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `subject-register-form.errors.cannot-save-subject`
          );
        },
      });
  }
}
