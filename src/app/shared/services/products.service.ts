import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, defer, map, of, tap } from 'rxjs';
import {
  ProductDetailsModel,
  ProductDetailsModelLike,
  ProductModel,
  ProductModelLike,
} from '../models/product.model';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { ProductRegisterDTOLike } from '../models/dtos/product-register.dto';
import { RxEventBus } from '@rxjs-toolkit/eventbus';
import { TowerEvents } from '../constants/tower.constant';

@Injectable()
export class ProductsService implements OnDestroy {
  private cacheService: ICacheService;

  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    cacheFactory: CacheFactoryService,
    private eventbus: RxEventBus
  ) {
    this.cacheService = cacheFactory.getOrCreate('products');

    this.subscription = this.eventbus
      .on(TowerEvents.ACTIVE_CHANGED)
      .subscribe(() => {
        this.cacheService.clear();
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  list(): Observable<ProductModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<ProductModelLike[]>(`~api/products`).pipe(
          map((res) => {
            return res.map((x) => {
              return new ProductModel(x);
            });
          })
        );
      },
    });
  }

  listAll(): Observable<ProductDetailsModel[]> {
    return this.http.get<ProductDetailsModelLike[]>(`~api/products/all`).pipe(
      map((res) => {
        return res.map((x) => {
          return new ProductDetailsModel(x);
        });
      })
    );
  }

  listByTowers(towerIds: number[]) {
    return this.list().pipe(
      map((list) => {
        return (
          towerIds?.flatMap((towerId) => {
            return list.filter((x) => x.towerId === towerId);
          }) ?? []
        );
      })
    );
  }

  create(dto: ProductRegisterDTOLike) {
    return this.http.post<ProductDetailsModelLike>(`~api/products`, dto).pipe(
      tap(() => {
        this.cacheService.clear();
      })
    );
  }

  setActive(productId: number, active: boolean) {
    return this.http
      .post<any>(`~api/products/${productId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }
}
