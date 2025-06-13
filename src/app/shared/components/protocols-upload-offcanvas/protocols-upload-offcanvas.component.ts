import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Inject,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { IconicModule } from '../iconic/iconic.module';
import { TranslateModule } from '@ngx-translate/core';
import { OffcanvasTemplateComponent } from '../offcanvas-template/offcanvas-template.component';
import { NgbAlertModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ProtocolsService } from '../../services/protocols.service';
import { ToastService } from '../../services/toast.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import {
  ProtocolImportStatus,
  ProtocolsFileLogModel,
} from '../../models/protocols-file-log.model';
import { Observable, finalize, shareReplay } from 'rxjs';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { HoverClassDirective } from '../../directives/hover-class/hover-class.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import FileSaver from 'file-saver';
import { ProtocolFilterLike } from 'src/app/shared/models/dtos/protocol-filter.dto';
import { PaginationComponent } from '../pagination/pagination.component';

@Component({
  selector: 'app-protocols-upload-offcanvas',
  templateUrl: 'protocols-upload-offcanvas.component.html',
  styleUrls: ['protocols-upload-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    NgbAlertModule,
    NgbTooltipModule,
    OffcanvasTemplateComponent,
    IconicModule,
    LoadingIndicatorComponent,
    HoverClassDirective,
    PaginationComponent,
  ],
})
export class ProtocolsUploadOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  private filters: ProtocolFilterLike;
  error: string;

  alert: {
    type: ProtocolImportStatus;
    message: string;
  } = null;

  logsDataSource: CustomDataSource<ProtocolsFileLogModel>;
  logsObservable: Observable<ProtocolsFileLogModel[]>;

  protected protocolImportStatus = ProtocolImportStatus;

  constructor(
    private protocolsService: ProtocolsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.logsDataSource = new CustomDataSource<ProtocolsFileLogModel>({
      load: (options) => {
        return this.protocolsService.listImportsPaged({
          ...this.filters,
          ...options,
          requireTotalCount: true,
        });
      },
      pageSize: 8,
      initialLoad: true,
    });

    this.logsObservable = this.logsDataSource.toObservable().pipe(
      shareReplay({
        refCount: false,
        bufferSize: 1,
      })
    );
  }

  ngOnDestroy(): void {
    this.logsDataSource?.dispose();

    this.logsObservable = null;
  }

  onBtnDownloadTemplateClick() {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.protocolsService
      .downloadImportTemplate()
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (blob) => {
          this.toastService.success(
            `protocols-upload-offcanvas.messages.protocols-template-downloaded`
          );

          FileSaver.saveAs(blob, blob.name || `modelo_upload_protocolos.xlsx`);
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `protocols-upload-offcanvas.errors.cannot-download-template`
          );
        },
      });
  }

  onImportProtocolsFileChanged(inputEl: HTMLInputElement) {
    this.error = null;

    const file = inputEl.files?.item?.(0);
    if (!file || this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.protocolsService
      .importProtocols(file)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();

          inputEl.value = '';
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.toastService.success(
            `protocols-upload-offcanvas.messages.protocols-imported`
          );

          // this.logsDataSource.clearRawData();
          this.logsDataSource.reload();
        },
        error: (response) => {
          if (!response) {
            return;
          }

          let msg = response.error?.messages?.join('\n');

          this.error = msg;

          this.toastService.error(
            msg || `protocols-upload-offcanvas.errors.cannot-import-protocols`
          );
        },
      });
  }

  onDownloadProtocolClick(id: number) {
    this.globalLoadingController.show();
    this.protocolsService
      .downloadProtocolImported(id)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.toastService.success(
            `protocols-upload-offcanvas.messages.protocols-downloaded`
          );

          FileSaver.saveAs(response.blob, response.name);
        },
        error: (response) => {
          if (!response) {
            return;
          }

          this.toastService.error(
            `protocols-upload-offcanvas.errors.cannot-download-protocol`
          );
        },
      });
  }
}
