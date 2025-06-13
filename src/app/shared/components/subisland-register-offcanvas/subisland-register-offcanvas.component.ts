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
import { SubislandRegisterFormComponent } from './components/subisland-register-form/subisland-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { ArrayUtils } from '../../utils/array.utils';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import orderBy from 'lodash/orderBy';
import { SubislandsService } from '../../services/subislands.service';
import { SubislandDetailsModel } from '../../models/subisland.model';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { LoadingController } from '../../helpers/loading.controller';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface GroupLike {
  key: string;
  tower: string;
  towerId: number;
  island: string;
  islandId: number;
  list: SubislandDetailsModel[];
}

@Component({
  selector: 'app-subisland-register-offcanvas',
  templateUrl: 'subisland-register-offcanvas.component.html',
  styleUrls: ['subisland-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    SubislandRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class SubislandRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<SubislandDetailsModel>;
  listObservable: Observable<GroupLike[]>;

  groupListTrackBy = ItemExprUtils.trackByFunction<GroupLike>((x) => x.key);
  listTrackBy = ItemExprUtils.trackByFunction<SubislandDetailsModel>(
    (x) => x.id
  );

  constructor(
    private subislandsService: SubislandsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<SubislandDetailsModel>({
      load: () => {
        return this.subislandsService.listAll();
      },
      initialLoad: true,
    });

    this.listObservable = this.listDataSource.toObservable().pipe(
      map((list) => {
        const groupsMap = ArrayUtils.groupBy(
          list,
          (x) => `${x.towerId}-${x.islandId}`
        );

        let groupList: GroupLike[] = Array.from(groupsMap, ([key, list]) => {
          const { towerId, tower, islandId, island } = list[0];

          return {
            key,
            towerId,
            tower,
            islandId,
            island,
            list,
          };
        });

        groupList = orderBy(groupList, [(x) => x.tower, (x) => x.island]);

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

  onSubislandSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: SubislandDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.subislandsService
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
            ? `subisland-register-offcanvas.messages.subisland-activated`
            : `subisland-register-offcanvas.messages.subisland-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `subisland-register-offcanvas.errors.cannot-active-subisland`
            : `subisland-register-offcanvas.errors.cannot-inactive-subisland`;

          this.toastService.error(msg);
        },
      });
  }
}
