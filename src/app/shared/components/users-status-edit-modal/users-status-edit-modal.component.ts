import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
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
import { finalize, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserFilterLike } from '../../models/dtos/user-filter.dto';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';

interface StatusEditFormLike {
  status: FormControl<UserStatus>;
  returnedAt: FormControl<Date>;
}

@Component({
  selector: 'app-users-status-edit-modal',
  templateUrl: 'users-status-edit-modal.component.html',
  styleUrls: ['users-status-edit-modal.component.scss'],
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
export class UsersStatusEditModalComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  @Input()
  filters: UserFilterLike;

  formGroup: FormGroup<StatusEditFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  submitted: boolean;

  statusDataSource = this.usersService.listStatusForAction();

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<StatusEditFormLike>({
      status: this.formBuilder.control<UserStatus>(null, [Validators.required]),
      returnedAt: this.formBuilder.control<Date>(null, [Validators.required]),
    });
  }

  ngOnInit(): void {
    this.f.status.valueChanges
      .pipe(
        startWith(this.f.status.getRawValue()),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((status) => {
        if (status === UserStatus.Inactive) {
          this.f.returnedAt.enable();
        } else {
          this.f.returnedAt.disable();
          this.f.returnedAt.reset();
        }
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

    const { status, returnedAt } = this.formGroup.getRawValue();

    this.globalLoadingController.show();
    this.usersService
      .updateStatus(status, returnedAt, this.filters)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `users-status-edit-modal.messages.statusUpdated`
          );
          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `users-status-edit-modal.errors.cannotUpdateStatus`
          );
        },
      });
  }
}
