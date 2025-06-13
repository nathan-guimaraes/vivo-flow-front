import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Inject,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { OffcanvasTemplateComponent } from '../offcanvas-template/offcanvas-template.component';
import { LoadingIndicatorComponent } from '../loading-indicator/loading-indicator.component';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { ToastService } from '../../services/toast.service';
import { Observable, finalize, shareReplay } from 'rxjs';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { SegmentRegisterFormComponent } from './components/segment-register-form/segment-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { SegmentsService } from '../../services/segments.service';
import { SegmentDetailsModel } from '../../models/segment.model';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { LoadingController } from '../../helpers/loading.controller';

@Component({
  selector: 'app-segment-register-offcanvas',
  templateUrl: 'segment-register-offcanvas.component.html',
  styleUrls: ['segment-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    SegmentRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class SegmentRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<SegmentDetailsModel>;
  listObservable: Observable<SegmentDetailsModel[]>;

  listTrackBy = ItemExprUtils.trackByFunction<SegmentDetailsModel>((x) => x.id);

  constructor(
    private segmentsService: SegmentsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<SegmentDetailsModel>({
      load: () => {
        return this.segmentsService.listAll();
      },
      initialLoad: true,
    });

    this.listObservable = this.listDataSource.toObservable().pipe(
      shareReplay({
        refCount: false,
        bufferSize: 1,
      })
    );
  }

  ngOnDestroy(): void {
    this.listDataSource?.dispose();

    this.listObservable = null;
  }

  onSegmentSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: SegmentDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.segmentsService
      .setActive(item.id, active)
      .pipe(
        finalize(() => {
          this.globalLoadingController.hide();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          const msg = active
            ? `segment-register-offcanvas.messages.segment-activated`
            : `segment-register-offcanvas.messages.segment-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `segment-register-offcanvas.errors.cannot-active-segment`
            : `segment-register-offcanvas.errors.cannot-inactive-segment`;

          this.toastService.error(msg);
        },
      });
  }
}
