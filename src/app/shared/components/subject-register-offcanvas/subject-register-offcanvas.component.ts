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
import { SubjectRegisterFormComponent } from './components/subject-register-form/subject-register-form.component';

import {
  fadeInExpandOnEnterAnimation,
  fadeOutCollapseOnLeaveAnimation,
} from 'angular-animations';
import { ArrayUtils } from '../../utils/array.utils';
import { ItemExprUtils } from '../../utils/item-expr.utils';
import orderBy from 'lodash/orderBy';
import { SubjectDetailsModel } from '../../models/subject.model';
import { SubjectsService } from '../../services/subjects.service';
import { LoadingController } from '../../helpers/loading.controller';
import { GLOBAL_LOADING } from '../../constants/loading-controller.constant';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface GroupLike {
  key: string;
  tower: string;
  towerId: number;
  island: string;
  islandId: number;
  subisland: string;
  subislandId: number;
  list: SubjectDetailsModel[];
}

@Component({
  selector: 'app-subject-register-offcanvas',
  templateUrl: 'subject-register-offcanvas.component.html',
  styleUrls: ['subject-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    SubjectRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class SubjectRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<SubjectDetailsModel>;
  listObservable: Observable<GroupLike[]>;

  groupListTrackBy = ItemExprUtils.trackByFunction<GroupLike>((x) => x.key);
  listTrackBy = ItemExprUtils.trackByFunction<SubjectDetailsModel>((x) => x.id);

  constructor(
    private subjectsService: SubjectsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<SubjectDetailsModel>({
      load: () => {
        return this.subjectsService.listAll();
      },
      initialLoad: true,
    });

    this.listObservable = this.listDataSource.toObservable().pipe(
      map((list) => {
        const groupsMap = ArrayUtils.groupBy(
          list,
          (x) => `${x.towerId}-${x.islandId}-${x.subislandId}`
        );

        let groupList: GroupLike[] = Array.from(groupsMap, ([key, list]) => {
          const { towerId, tower, islandId, island, subislandId, subisland } =
            list[0];

          return {
            key,
            towerId,
            tower,
            islandId,
            island,
            subislandId,
            subisland,
            list,
          };
        });

        groupList = orderBy(groupList, [
          (x) => x.tower,
          (x) => x.island,
          (x) => x.subisland,
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

  onSubjectSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: SubjectDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.subjectsService
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
            ? `subject-register-offcanvas.messages.subject-activated`
            : `subject-register-offcanvas.messages.subject-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `subject-register-offcanvas.errors.cannot-active-subject`
            : `subject-register-offcanvas.errors.cannot-inactive-subject`;

          this.toastService.error(msg);
        },
      });
  }
}
