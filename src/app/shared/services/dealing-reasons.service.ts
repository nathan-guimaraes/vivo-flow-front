import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, defer, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { RxEventBus } from '@rxjs-toolkit/eventbus';
import { TowerEvents } from '../constants/tower.constant';
import {
  DealingReasonModelLike,
  DealingReasonModel,
  DealingReasonDetailsModel,
  DealingReasonDetailsModelLike,
} from '../models/dealing-reason.model';
import { ProductModel } from '../models/product.model';
import { DealingReasonRegisterDTOLike } from '../models/dtos/dealing-reason-register.dto';
import { DealingReasonEvents } from '../constants/dealing-reason.constant';

@Injectable()
export class DealingReasonsService implements OnDestroy {
  private cacheService: ICacheService;

  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    cacheFactory: CacheFactoryService,
    private eventbus: RxEventBus
  ) {
    this.cacheService = cacheFactory.getOrCreate('DealingReasons');

    this.subscription = this.eventbus
      .on(TowerEvents.ACTIVE_CHANGED)
      .subscribe(() => {
        this.cacheService.clear();

        this.eventbus.emit(DealingReasonEvents.ACTIVE_CHANGED);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  list(): Observable<ProductModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http
          .get<DealingReasonModelLike[]>(`~api/DealingReasons`)
          .pipe(
            map((res) => {
              return res.map((x) => {
                return new DealingReasonModel(x);
              });
            })
          );
      },
    });
  }

  listAll(): Observable<DealingReasonDetailsModel[]> {
    return this.http
      .get<DealingReasonDetailsModelLike[]>(`~api/DealingReasons/all`)
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new DealingReasonDetailsModel(x);
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

  create(dto: DealingReasonRegisterDTOLike) {
    return this.http
      .post<DealingReasonDetailsModelLike>(`~api/DealingReasons`, dto)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(dealingReasonId: number, active: boolean) {
    return this.http
      .post<any>(`~api/DealingReasons/${dealingReasonId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();

          this.eventbus.emit(DealingReasonEvents.ACTIVE_CHANGED);
        })
      );
  }
}
