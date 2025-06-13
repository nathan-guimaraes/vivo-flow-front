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
import { CustomDataSource } from '../../helpers/datasources/custom-datasource';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { ToastService } from '../../services/toast.service';
import { Observable, finalize, shareReplay } from 'rxjs';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { WorkscaleRegisterFormComponent } from './components/workscale-register-form/workscale-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { WorkscalesService } from '../../services/workscale.service';
import { WorkscaleDetailsModel } from '../../models/workscale.model';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { LoadingController } from '../../helpers/loading.controller';

@Component({
  selector: 'app-workscale-register-offcanvas',
  templateUrl: 'workscale-register-offcanvas.component.html',
  styleUrls: ['workscale-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    WorkscaleRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class WorkscaleRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<WorkscaleDetailsModel>;
  listObservable: Observable<WorkscaleDetailsModel[]>;

  listTrackBy = ItemExprUtils.trackByFunction<WorkscaleDetailsModel>(
    (x) => x.id
  );

  constructor(
    private workscalesService: WorkscalesService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<WorkscaleDetailsModel>({
      load: () => {
        return this.workscalesService.listAll();
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

  onWorkscaleSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: WorkscaleDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.workscalesService
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
            ? `workscale-register-offcanvas.messages.workscale-activated`
            : `workscale-register-offcanvas.messages.workscale-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `workscale-register-offcanvas.errors.cannot-active-workscale`
            : `workscale-register-offcanvas.errors.cannot-inactive-workscale`;

          this.toastService.error(msg);
        },
      });
  }
}
