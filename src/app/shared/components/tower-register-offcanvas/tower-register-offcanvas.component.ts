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
import { TowerDetailsModel, TowerModel } from '../../models/tower.model';
import { CustomRawDataSource } from '../../helpers/datasources/custom-raw-datasource';
import { TowersService } from '../../services/towers.service';
import { ToastService } from '../../services/toast.service';
import { Observable, finalize, shareReplay } from 'rxjs';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { TowerRegisterFormComponent } from './components/tower-register-form/tower-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { LoadingController } from '../../helpers/loading.controller';

@Component({
  selector: 'app-tower-register-offcanvas',
  templateUrl: 'tower-register-offcanvas.component.html',
  styleUrls: ['tower-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    TowerRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class TowerRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<TowerDetailsModel>;
  listObservable: Observable<TowerDetailsModel[]>;

  listTrackBy = ItemExprUtils.trackByFunction<TowerDetailsModel>((x) => x.id);

  constructor(
    private towersService: TowersService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<TowerDetailsModel>({
      load: () => {
        return this.towersService.listAll();
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

  onTowerSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: TowerDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.towersService
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
            ? `tower-register-offcanvas.messages.tower-activated`
            : `tower-register-offcanvas.messages.tower-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `tower-register-offcanvas.errors.cannot-active-tower`
            : `tower-register-offcanvas.errors.cannot-inactive-tower`;

          this.toastService.error(msg);
        },
      });
  }
}
