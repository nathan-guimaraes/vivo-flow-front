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
import { NegotiationTypeRegisterFormComponent } from './components/negotiation-type-register-form/negotiation-type-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { IslandsService } from '../../services/islands.service';
import { IslandDetailsModel } from '../../models/island.model';
import { ArrayUtils } from '../../utils/array.utils';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import orderBy from 'lodash/orderBy';
import { NegotiationTypeDetailsModel } from '../../models/negotiation-type.model';
import { NegotiationTypesService } from '../../services/negotiation-types.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';

interface GroupLike {
  key: string;
  tower: string;
  towerId: number;
  list: NegotiationTypeDetailsModel[];
}

@Component({
  selector: 'app-negotiation-type-register-offcanvas',
  templateUrl: 'negotiation-type-register-offcanvas.component.html',
  styleUrls: ['negotiation-type-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    NegotiationTypeRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class NegotiationTypeRegisterOffcanvasComponent
  implements OnInit, OnDestroy
{
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<NegotiationTypeDetailsModel>;
  listObservable: Observable<GroupLike[]>;

  groupListTrackBy = ItemExprUtils.trackByFunction<GroupLike>((x) => x.key);
  listTrackBy = ItemExprUtils.trackByFunction<NegotiationTypeDetailsModel>(
    (x) => x.id
  );

  constructor(
    private negotiationTypesService: NegotiationTypesService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<NegotiationTypeDetailsModel>({
      load: () => {
        return this.negotiationTypesService.listAll();
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

  onNegotiationTypeSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: NegotiationTypeDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.negotiationTypesService
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
            ? `negotiation-type-register-offcanvas.messages.negotiation-type-activated`
            : `negotiation-type-register-offcanvas.messages.negotiation-type-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `negotiation-type-register-offcanvas.errors.cannot-active-negotiation-type`
            : `negotiation-type-register-offcanvas.errors.cannot-inactive-negotiation-type`;

          this.toastService.error(msg);
        },
      });
  }
}
