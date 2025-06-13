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
import { DealingSubreason2RegisterFormComponent } from './components/dealing-subreason2-register-form/dealing-subreason2-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { ArrayUtils } from '../../utils/array.utils';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import orderBy from 'lodash/orderBy';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DealingSubreasonDetailsModel } from '../../models/dealing-subreason.model';
import { DealingSubreasonsService } from '../../services/dealing-subreasons.service';
import { DealingSubreason2DetailsModel } from '../../models/dealing-subreason2.model';
import { DealingSubreason2Service } from '../../services/dealing-subreason2.service';

interface GroupLike {
  key: string;
  tower: string;
  towerId: number;
  dealingReason: string;
  dealingReasonId: number;
  dealingSubreason: string;
  dealingSubreasonId: number;
  list: DealingSubreason2DetailsModel[];
}

@Component({
  selector: 'app-dealing-subreason2-register-offcanvas',
  templateUrl: 'dealing-subreason2-register-offcanvas.component.html',
  styleUrls: ['dealing-subreason2-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    DealingSubreason2RegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class DealingSubreason2RegisterOffcanvasComponent
  implements OnInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<DealingSubreason2DetailsModel>;
  listObservable: Observable<GroupLike[]>;

  groupListTrackBy = ItemExprUtils.trackByFunction<GroupLike>((x) => x.key);
  listTrackBy = ItemExprUtils.trackByFunction<DealingSubreason2DetailsModel>(
    (x) => x.id
  );

  constructor(
    private dealingSubreason2Service: DealingSubreason2Service,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource =
      new CustomRawDataSource<DealingSubreason2DetailsModel>({
        load: () => {
          return this.dealingSubreason2Service.listAll();
        },
        initialLoad: true,
      });

    this.listObservable = this.listDataSource.toObservable().pipe(
      map((list) => {
        const groupsMap = ArrayUtils.groupBy(
          list,
          (x) => `${x.towerId}-${x.dealingReasonId}-${x.dealingSubreasonId}`
        );

        let groupList: GroupLike[] = Array.from(groupsMap, ([key, list]) => {
          const {
            dealingSubreasonId,
            dealingSubreason,
            dealingReasonId,
            dealingReason,
            towerId,
            tower,
          } = list[0];

          return {
            key,
            dealingSubreasonId,
            dealingSubreason,
            dealingReasonId,
            dealingReason,
            towerId,
            tower,
            list,
          };
        });

        groupList = orderBy(groupList, [
          (x) => x.tower,
          (x) => x.dealingReason,
          (x) => x.dealingSubreason,
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

  onDealingSubreason2Saved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: DealingSubreason2DetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.dealingSubreason2Service
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
            ? `dealing-subreason2-register-offcanvas.messages.dealing-subreason2-activated`
            : `dealing-subreason2-register-offcanvas.messages.dealing-subreason2-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `dealing-subreason2-register-offcanvas.errors.cannot-active-dealing-subreason2`
            : `dealing-subreason2-register-offcanvas.errors.cannot-inactive-dealing-subreason2`;

          this.toastService.error(msg);
        },
      });
  }
}
