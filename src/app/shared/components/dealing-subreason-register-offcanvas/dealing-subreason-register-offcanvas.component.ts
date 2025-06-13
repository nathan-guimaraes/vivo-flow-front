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
import {
  Observable,
  asapScheduler,
  finalize,
  map,
  observeOn,
  shareReplay,
} from 'rxjs';
import { CheckboxComponent } from '../checkbox/checkbox.component';
import { DealingSubreasonRegisterFormComponent } from './components/dealing-subreason-register-form/dealing-subreason-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { ArrayUtils } from '../../utils/array.utils';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import orderBy from 'lodash/orderBy';
import { ProductDetailsModel } from '../../models/product.model';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DealingSubreasonDetailsModel } from '../../models/dealing-subreason.model';
import { DealingSubreasonsService } from '../../services/dealing-subreasons.service';

interface GroupLike {
  key: string;
  tower: string;
  towerId: number;
  dealingReason: string;
  dealingReasonId: number;
  list: DealingSubreasonDetailsModel[];
}

@Component({
  selector: 'app-dealing-subreason-register-offcanvas',
  templateUrl: 'dealing-subreason-register-offcanvas.component.html',
  styleUrls: ['dealing-subreason-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    DealingSubreasonRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class DealingSubreasonRegisterOffcanvasComponent
  implements OnInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<DealingSubreasonDetailsModel>;
  listObservable: Observable<GroupLike[]>;

  groupListTrackBy = ItemExprUtils.trackByFunction<GroupLike>((x) => x.key);
  listTrackBy = ItemExprUtils.trackByFunction<DealingSubreasonDetailsModel>(
    (x) => x.id
  );

  constructor(
    private dealingSubreasonsService: DealingSubreasonsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<DealingSubreasonDetailsModel>(
      {
        load: () => {
          return this.dealingSubreasonsService.listAll();
        },
        initialLoad: true,
      }
    );

    this.listObservable = this.listDataSource.toObservable().pipe(
      map((list) => {
        const groupsMap = ArrayUtils.groupBy(
          list,
          (x) => `${x.towerId}-${x.dealingReasonId}`
        );

        let groupList: GroupLike[] = Array.from(groupsMap, ([key, list]) => {
          const { dealingReasonId, dealingReason, towerId, tower } = list[0];

          return { key, dealingReasonId, dealingReason, towerId, tower, list };
        });

        groupList = orderBy(groupList, [
          (x) => x.tower,
          (x) => x.dealingReason,
        ]);

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

  onDealingSubreasonSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: DealingSubreasonDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.dealingSubreasonsService
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
            ? `dealing-subreason-register-offcanvas.messages.dealing-subreason-activated`
            : `dealing-subreason-register-offcanvas.messages.dealing-subreason-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `dealing-subreason-register-offcanvas.errors.cannot-active-dealing-subreason`
            : `dealing-subreason-register-offcanvas.errors.cannot-inactive-dealing-subreason`;

          this.toastService.error(msg);
        },
      });
  }
}
