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
import {
  NgbActiveModal,
  NgbAlertModule,
  NgbModalModule,
} from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { UsersService } from '../../services/users.service';
import { FieldModule } from '../field/field.module';
import { OptionModelLike } from '../../models/option.model';
import { UserStatus } from '../../models/user.model';
import { CommonModule } from '@angular/common';
import { DateBoxComponent } from '../date-box/date-box.component';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserFilterLike } from '../../models/dtos/user-filter.dto';

interface DelgateFormLike {
  userTargetId: FormControl<number>;
  startedAt: FormControl<Date>;
  endedAt: FormControl<Date>;
  reason: FormControl<string>;
}

@Component({
  selector: 'app-delegate-activities-modal',
  templateUrl: 'delegate-activities-modal.component.html',
  styleUrls: ['delegate-activities-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NgbModalModule,
    NgbAlertModule,
    ModalTemplateComponent,
    FieldModule,
    SelectBoxModule,
    DateBoxComponent,
    IconicModule,
  ],
})
export class DelegateActivitiesModalComponent {
  private destroyRef = inject(DestroyRef);

  @Input()
  filters: UserFilterLike;

  formGroup: FormGroup<DelgateFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  submitted: boolean;

  usersDataSource = this.usersService.listSupervisors();

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<DelgateFormLike>({
      userTargetId: this.formBuilder.control<number>(null, [
        Validators.required,
      ]),
      startedAt: this.formBuilder.control<Date>(null, [Validators.required]),
      endedAt: this.formBuilder.control<Date>(null, [Validators.required]),
      reason: this.formBuilder.control<string>(null, [Validators.required]),
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

    const values = this.formGroup.getRawValue();

    this.globalLoadingController.show();
    this.usersService
      .delegate(values, this.filters)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'delegate-activities-modal.success.delegation-succeeded'
          );

          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `delegate-activities-modal.errors.cannot-delegate`
          );
        },
      });
  }
}
