import { Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
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
import { FieldModule } from '../field/field.module';
import { OptionModelLike } from '../../models/option.model';
import { CommonModule } from '@angular/common';
import { DateBoxComponent } from '../date-box/date-box.component';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import FileSaver from 'file-saver';
import { LogsReportDownloadModalService } from './logs-report-download-modal.service';
import {
  LogsReportFilterLike,
  LogsReportFilterOptionsDTO,
} from '../../models/dtos/logs-report-filter.dto';

interface FilterFormLike {
  startDate: FormControl<Date>;
  endDate: FormControl<Date>;
  actions: FormControl<any[]>;
}

@Component({
  selector: 'app-logs-report-download-modal',
  templateUrl: 'logs-report-download-modal.component.html',
  styleUrls: ['logs-report-download-modal.component.scss'],
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
  providers: [LogsReportDownloadModalService],
})
export class LogsReportDownloadModalComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  formGroup: FormGroup<FilterFormLike>;

  get f() {
    return this.formGroup.controls;
  }

  submitted: boolean;

  private filters: LogsReportFilterLike = new LogsReportFilterOptionsDTO();
  repostTypeDataSource =
    this.logsReportDownloadModalService.listLogReportTypes();

  constructor(
    public activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private logsReportDownloadModalService: LogsReportDownloadModalService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {
    this.formGroup = this.formBuilder.group<FilterFormLike>({
      startDate: this.formBuilder.control<Date>(null, [Validators.required]),
      endDate: this.formBuilder.control<Date>(null, [Validators.required]),
      actions: this.formBuilder.control<any[]>(null, [Validators.required]),
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.submitted = true;
    if (this.formGroup.invalid) {
      return;
    }

    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.filters.startDate = new Date(this.f.startDate.value);
    this.filters.endDate = new Date(this.f.endDate.value);
    this.filters.types = this.f.actions.value;

    this.globalLoadingController.show();
    this.logsReportDownloadModalService
      .export({ ...this.filters })
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (blob) => {
          FileSaver.saveAs(blob, blob.name || `relatorio-${Date.now()}.zip`);

          this.toastService.success(
            `logs-report-download-modal.messages.logs-report-exported`
          );

          this.activeModal.dismiss();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `logs-report-download-modal.errors.logReportDownloadFail`
          );
        },
      });
  }

  selectedTextExpr = (x) => null;
}
