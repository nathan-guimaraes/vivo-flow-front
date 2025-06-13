import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbActiveOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IconicModule } from '../iconic/iconic.module';
import { FieldModule } from '../field/field.module';
import { SelectBoxModule } from '../select-box/select-box.module';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { LoadingController } from '../../helpers/loading.controller';
import { ToastService } from '../../services/toast.service';
import { OffcanvasTemplateComponent } from '../offcanvas-template/offcanvas-template.component';
import { ProtocolsService } from '../../services/protocols.service';
import { ProtocolFilterLike } from '../../models/dtos/protocol-filter.dto';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { OptionModelLike } from '../../models/option.model';
import { UsersService } from '../../services/users.service';
import { SubislandsService } from '../../services/subislands.service';
import { ProtocolPriority } from '../../models/protocol.model';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { SubislandModel } from '../../models/subisland.model';
import { UserSimpleModelLike } from '../../models/user.model';

interface DistributionFormLike {
  priority: FormControl<ProtocolPriority>;
  subislandId: FormControl<number>;
  userId: FormControl<number>;
}

@Component({
  selector: 'app-distribution-protocols-offcanvas',
  templateUrl: 'distribution-protocols-offcanvas.component.html',
  styleUrls: ['distribution-protocols-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    FieldModule,
    SelectBoxModule,
    IconicModule,
  ],
})
export class DistributionProtocolsOffcanvasComponent
  implements OnInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  @Input()
  filters: ProtocolFilterLike;

  formGroup: FormGroup<DistributionFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  submitted: boolean;

  priorityDataSource: OptionModelLike<ProtocolPriority>[] = [
    {
      label: this.translateService.instant(
        'distribution-protocols-offcanvas.form.priority.fields.none'
      ),
      value: ProtocolPriority.None,
    },
    {
      label: this.translateService.instant(
        'distribution-protocols-offcanvas.form.priority.fields.current'
      ),
      value: ProtocolPriority.Current,
    },
    {
      label: this.translateService.instant(
        'distribution-protocols-offcanvas.form.priority.fields.all'
      ),
      value: ProtocolPriority.All,
    },
  ];
  subislandDataSource: CustomRawDataSource<SubislandModel>;
  userDataSource: CustomRawDataSource<UserSimpleModelLike>;

  get isBtnDisabled() {
    return !Object.values(this.formGroup.getRawValue()).some((x) => {
      return x !== undefined && x !== null;
    });
  }

  constructor(
    public activeOffcanvas: NgbActiveOffcanvas,
    private formBuilder: FormBuilder,
    private protocolsService: ProtocolsService,
    private subislandsService: SubislandsService,
    private usersService: UsersService,
    private translateService: TranslateService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController,
    private toastService: ToastService
  ) {
    this.formGroup = this.formBuilder.group<DistributionFormLike>({
      priority: this.formBuilder.control<ProtocolPriority>(null),
      subislandId: this.formBuilder.control<number>(null),
      userId: this.formBuilder.control<number>(null),
    });
  }

  ngOnInit(): void {
    this.subislandDataSource = new CustomRawDataSource<SubislandModel>({
      load: () => {
        return this.subislandsService.listSubislandsRelatedFlow(this.filters);
      },
    });
    this.userDataSource = new CustomRawDataSource<UserSimpleModelLike>({
      load: () => {
        const subislandId = this.f.subislandId.getRawValue();
        return this.usersService.listUsersRelatedProtocols(
          this.filters,
          subislandId
        );
      },
    });

    const toggleControls = (disabled: boolean) => {
      [this.f.subislandId, this.f.userId].forEach((aux) => {
        if (disabled) {
          aux.disable();
        } else {
          aux.enable();
        }
      });
    };

    toggleControls(true);

    this.globalLoadingController.show();
    this.protocolsService
      .hasDifferentProtocols(this.filters)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (aBool) => {
          toggleControls(aBool);

          if (aBool) {
            this.toastService.warning(
              `distribution-protocols-offcanvas.warnings.has-differents-protocols`
            );
          }
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `distribution-protocols-offcanvas.errors.cannot-validate-protocols`
          );
        },
      });

    this.f.subislandId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.f.userId.reset();
        this.userDataSource?.clearRawData();
        this.userDataSource?.reload();
      });
  }

  ngOnDestroy(): void {
    this.subislandDataSource?.dispose();
    this.userDataSource?.dispose();
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
    this.protocolsService
      .assign(values, this.filters)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `distribution-protocols-offcanvas.messages.protocols-updated`
          );

          this.activeOffcanvas.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          let msg =
            response.error?.messages?.join('\n') ||
            `distribution-protocols-offcanvas.errors.cannot-update-protocols`;

          this.toastService.error(msg);
        },
      });
  }
}
