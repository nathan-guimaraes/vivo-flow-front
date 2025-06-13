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
import { ProductRegisterFormComponent } from './components/product-register-form/product-register-form.component';

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

interface GroupLike {
  key: string;
  tower: string;
  towerId: number;
  list: ProductDetailsModel[];
}

@Component({
  selector: 'app-product-register-offcanvas',
  templateUrl: 'product-register-offcanvas.component.html',
  styleUrls: ['product-register-offcanvas.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    OffcanvasTemplateComponent,
    LoadingIndicatorComponent,
    ProductRegisterFormComponent,
    CheckboxComponent,
  ],
  animations: [
    fadeInExpandOnEnterAnimation({ anchor: 'enter' }),
    fadeOutCollapseOnLeaveAnimation({ anchor: 'leave' }),
  ],
})
export class ProductRegisterOffcanvasComponent implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);

  registerFormModeEnabled = false;

  listDataSource: CustomRawDataSource<ProductDetailsModel>;
  listObservable: Observable<GroupLike[]>;

  groupListTrackBy = ItemExprUtils.trackByFunction<GroupLike>((x) => x.key);
  listTrackBy = ItemExprUtils.trackByFunction<ProductDetailsModel>((x) => x.id);

  constructor(
    private productsService: ProductsService,
    private toastService: ToastService,
    @Inject(GLOBAL_LOADING) private globalLoadingController: LoadingController
  ) {}

  ngOnInit(): void {
    this.listDataSource = new CustomRawDataSource<ProductDetailsModel>({
      load: () => {
        return this.productsService.listAll();
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

  onProductSaved() {
    this.registerFormModeEnabled = false;

    this.listDataSource.clearRawData();
    this.listDataSource.reload();
  }

  setActive(item: ProductDetailsModel, active: boolean) {
    if (this.globalLoadingController.isShown()) {
      return;
    }

    this.globalLoadingController.show();
    this.productsService
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
            ? `product-register-offcanvas.messages.product-activated`
            : `product-register-offcanvas.messages.product-inactivated`;

          this.toastService.success(msg);

          item.active = active;
        },
        error: (response) => {
          item.active = !active;

          if (!response) {
            return;
          }

          const msg = active
            ? `product-register-offcanvas.errors.cannot-active-product`
            : `product-register-offcanvas.errors.cannot-inactive-product`;

          this.toastService.error(msg);
        },
      });
  }
}
