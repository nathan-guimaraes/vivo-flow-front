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
import { LegacyRegisterFormComponent } from './components/legacy-register-form/legacy-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import { LegacyDetailsModel } from '../../models/legacy.model';
import { LegaciesService } from '../../services/legacies.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { LoadingController } from '../../helpers/loading.controller';
import { SegmentDetailsModel } from '../../models/segment.model';

@Component({
  selector: 'app-legacy-register-offcanvas',
  templateUrl: 'legacy-register-offcanvas.component.html',
  styleUrls: ['legacy-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    LegacyRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class LegacyRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<LegacyDetailsModel>;
  listObservable: Observable<LegacyDetailsModel[]>;

  listTrackBy = ItemExprUtils.trackByFunction<LegacyDetailsModel>((x) => x.id);

  constructor(
    private legaciesService: LegaciesService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<LegacyDetailsModel>({
      load: () => {
        return this.legaciesService.listAll();
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

  onLegacySaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: SegmentDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.legaciesService
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
            ? `legacy-register-offcanvas.messages.legacy-activated`
            : `legacy-register-offcanvas.messages.legacy-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `legacy-register-offcanvas.errors.cannot-active-legacy`
            : `legacy-register-offcanvas.errors.cannot-inactive-legacy`;

          this.toastService.error(msg);
        },
      });
  }
}
