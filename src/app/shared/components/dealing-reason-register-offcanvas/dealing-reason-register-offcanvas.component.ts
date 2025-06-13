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
import {
  Observable,
  asapScheduler,
  finalize,
  map,
  observeOn,
  shareReplay,
} from 'rxjs';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { DealingReasonRegisterFormComponent } from './components/dealing-reason-register-form/dealing-reason-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { ArrayUtils } from '../../utils/array.utils';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import orderBy from 'lodash/orderBy';
import { ProductDetailsModel } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DealingReasonDetailsModel } from '../../models/dealing-reason.model';
import { DealingReasonsService } from '../../services/dealing-reasons.service';

interface GroupLike {
  key: string;
  tower: string;
  towerId: number;
  list: ProductDetailsModel[];
}

@Component({
  selector: 'app-dealing-reason-register-offcanvas',
  templateUrl: 'dealing-reason-register-offcanvas.component.html',
  styleUrls: ['dealing-reason-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    DealingReasonRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class DealingReasonRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<DealingReasonDetailsModel>;
  listObservable: Observable<GroupLike[]>;

  groupListTrackBy = ItemExprUtils.trackByFunction<GroupLike>((x) => x.key);
  listTrackBy = ItemExprUtils.trackByFunction<DealingReasonDetailsModel>(
    (x) => x.id
  );

  constructor(
    private dealingReasonsService: DealingReasonsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<DealingReasonDetailsModel>({
      load: () => {
        return this.dealingReasonsService.listAll();
      },
      initialLoad: true,
    });

    this.listObservable = this.listDataSource.toObservable().pipe(
      map((list) => {
        const groupsMap = ArrayUtils.groupBy(list, (x) => `${x.towerId}`);

        let groupList: GroupLike[] = Array.from(groupsMap, ([key, list]) => {
          const { towerId, tower } = list[0];

          return { key, towerId, tower, list };
        });

        groupList = orderBy(groupList, (x) => x.tower);

        return groupList;
      }),
      observeOn(asapScheduler),
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

  onDealingReasonSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: DealingReasonDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.dealingReasonsService
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
            ? `dealing-reason-register-offcanvas.messages.dealing-reason-activated`
            : `dealing-reason-register-offcanvas.messages.dealing-reason-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `dealing-reason-register-offcanvas.errors.cannot-active-dealing-reason`
            : `dealing-reason-register-offcanvas.errors.cannot-inactive-dealing-reason`;

          this.toastService.error(msg);
        },
      });
  }
}
