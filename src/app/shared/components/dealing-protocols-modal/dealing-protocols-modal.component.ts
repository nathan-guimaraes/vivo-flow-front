import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconicModule } from '../iconic/iconic.module';
import { NgbActiveModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { CommonModule } from '@angular/common';
import { CdkTableModule } from '@angular/cdk/table';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import { ModalTemplateComponent } from '../modal-template/modal-template.component';
import { TreatmentService } from '../../services/treatment.service';
import { TreatmentPauseReasonType } from '../../models/treatment-pause-reason.model';
import { treatmentPauseReasonMap } from '../../constants/treatments.constant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TreatmentStepWithProtocolModel } from '../../models/treatment-step.model';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import { PaginationComponent } from '../pagination/pagination.component';

enum TableColumnType {
  Date,
}

type ColumnInfo = {
  name: string;
  label?: string;
  width?: string;
  dataType?: TableColumnType;
  template?: any;
};

@Component({
  selector: 'app-dealing-protocols-modal',
  templateUrl: 'dealing-protocols-modal.component.html',
  styleUrls: ['dealing-protocols-modal.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbModalModule,
    CdkTableModule,
    ModalTemplateComponent,
    LoadingIndicatorComponent,
    IconicModule,
    PaginationComponent,
  ],
})
export class DealingProtocolsModalComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  @Input()
  playButtonEnabled = true;

  TableColumnType = TableColumnType;
  displayedColumnInfoList: ColumnInfo[];
  displayedColumns: string[];

  dataSource: CustomDataSource<TreatmentStepWithProtocolModel>;

  constructor(
    public activeModal: NgbActiveModal,
    private treatmentService: TreatmentService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.displayedColumnInfoList = [
      {
        name: 'protocolId',
        label: 'dealing-protocols-modal.table.headers.id',
        width: '120px',
      },
      {
        name: 'protocol.number',
        label: 'dealing-protocols-modal.table.headers.number',
        width: '160px',
      },
      {
        name: 'protocol.customer',
        label: 'dealing-protocols-modal.table.headers.customerName',
      },
      {
        name: 'protocol.document',
        label: 'dealing-protocols-modal.table.headers.document',
        width: '180px',
      },
      {
        name: 'treatmentTimeSpend',
        label: 'dealing-protocols-modal.table.headers.time',
        width: '100px',
      },
    ];
    this.displayedColumns = [].concat(
      this.displayedColumnInfoList.map((x) => x.name),
      'actions'
    );

    this.dataSource = new CustomDataSource<TreatmentStepWithProtocolModel>({
      load: (options) => {
        return this.treatmentService.listPagedPausedTreatments({
          ...options,
          requireTotalCount: true,
        });
      },
      pageSize: 5,
    });
  }

  ngOnDestroy(): void {
    this.dataSource?.dispose();
  }

  onBtnPlayProtocolClick(item: TreatmentStepWithProtocolModel) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.treatmentService
      .playTreatment(item.id)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            'dealing-protocols-modal.messages.protocol-played'
          );

          this.activeModal.close();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          const msg = response.error?.messages?.join('\n');

          this.toastService.error(
            msg || `dealing-protocols-modal.errors.cannot-play-protocol`
          );
        },
      });
  }

  isInTreatment(item: TreatmentStepWithProtocolModel) {
    return false;
  }

  getValue(item: TreatmentStepWithProtocolModel, fieldPath: string) {
    return ItemExprUtils.extractValue(item, null, fieldPath);
  }

  getStatusAlias(pauseType: TreatmentPauseReasonType) {
    return treatmentPauseReasonMap.get(pauseType);
  }
}
