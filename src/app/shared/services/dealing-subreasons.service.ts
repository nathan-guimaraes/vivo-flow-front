import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, map, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { RxEventBus } from '@rxjs-toolkit/eventbus';
import { DealingSubreasonRegisterDTOLike } from '../models/dtos/dealing-subreason-register.dto';
import {
  DealingSubreasonDetailsModel,
  DealingSubreasonDetailsModelLike,
  DealingSubreasonModel,
  DealingSubreasonModelLike,
} from '../models/dealing-subreason.model';
import { DealingReasonEvents } from '../constants/dealing-reason.constant';
import { DealingSubreasonEvents } from '../constants/dealing-subreason.constant';

@Injectable()
export class DealingSubreasonsService implements OnDestroy {
  private cacheService: ICacheService;

  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    cacheFactory: CacheFactoryService,
    private eventbus: RxEventBus
  ) {
    this.cacheService = cacheFactory.getOrCreate('DealingSubreasons');

    this.subscription = this.eventbus
      .on(DealingReasonEvents.ACTIVE_CHANGED)
      .subscribe(() => {
        this.cacheService.clear();
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  list(): Observable<DealingSubreasonModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http
          .get<DealingSubreasonModelLike[]>(`~api/DealingSubreasons`)
          .pipe(
            map((res) => {
              return res.map((x) => {
                return new DealingSubreasonModel(x);
              });
            })
          );
      },
    });
  }

  listAll(): Observable<DealingSubreasonDetailsModel[]> {
    return this.http
      .get<DealingSubreasonDetailsModelLike[]>(`~api/DealingSubreasons/all`)
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new DealingSubreasonDetailsModel(x);
          });
        })
      );
  }

  listByDealingReasons(dealingReasonIds: number[]) {
    return this.list().pipe(
      map((list) => {
        return (
          dealingReasonIds?.flatMap((id) => {
            return list.filter((x) => x.dealingReasonId === id);
          }) ?? []
        );
      })
    );
  }

  create(dto: DealingSubreasonRegisterDTOLike) {
    return this.http
      .post<DealingSubreasonDetailsModelLike>(`~api/DealingSubreasons`, dto)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(dealingSubreasonId: number, active: boolean) {
    return this.http
      .post<any>(`~api/DealingSubreasons/${dealingSubreasonId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();

          this.eventbus.emit(DealingSubreasonEvents.ACTIVE_CHANGED);
        })
      );
  }
}
