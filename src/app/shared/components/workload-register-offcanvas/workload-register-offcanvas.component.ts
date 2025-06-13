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
import { WorkloadRegisterFormComponent } from './components/workload-register-form/workload-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { WorkloadDetailsModel } from '../../models/workload.model';
import { WorkloadsService } from '../../services/workloads.service';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { LoadingController } from '../../helpers/loading.controller';

@Component({
  selector: 'app-workload-register-offcanvas',
  templateUrl: 'workload-register-offcanvas.component.html',
  styleUrls: ['workload-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    WorkloadRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class WorkloadRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<WorkloadDetailsModel>;
  listObservable: Observable<WorkloadDetailsModel[]>;

  listTrackBy = ItemExprUtils.trackByFunction<WorkloadDetailsModel>(
    (x) => x.id
  );

  constructor(
    private workloadsService: WorkloadsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<WorkloadDetailsModel>({
      load: () => {
        return this.workloadsService.listAll();
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

  onWorkloadSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: WorkloadDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.workloadsService
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
            ? `workload-register-offcanvas.messages.workload-activated`
            : `workload-register-offcanvas.messages.workload-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `workload-register-offcanvas.errors.cannot-active-workload`
            : `workload-register-offcanvas.errors.cannot-inactive-workload`;

          this.toastService.error(msg);
        },
      });
  }
}
