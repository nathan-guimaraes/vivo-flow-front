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
import { DealingSubreason2RegisterDTOLike } from '../models/dtos/dealing-subreason2-register.dto';
import {
  DealingSubreason2DetailsModel,
  DealingSubreason2DetailsModelLike,
  DealingSubreason2Model,
  DealingSubreason2ModelLike,
} from '../models/dealing-subreason2.model';

@Injectable()
export class DealingSubreason2Service implements OnDestroy {
  private cacheService: ICacheService;

  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    cacheFactory: CacheFactoryService,
    private eventbus: RxEventBus
  ) {
    this.cacheService = cacheFactory.getOrCreate('DealingSubreason2');

    this.subscription = this.eventbus
      .on(DealingSubreasonEvents.ACTIVE_CHANGED)
      .subscribe(() => {
        this.cacheService.clear();
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  list(): Observable<DealingSubreason2Model[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http
          .get<DealingSubreason2ModelLike[]>(`~api/DealingSubreason2`)
          .pipe(
            map((res) => {
              return res.map((x) => {
                return new DealingSubreason2Model(x);
              });
            })
          );
      },
    });
  }

  listAll(): Observable<DealingSubreason2DetailsModel[]> {
    return this.http
      .get<DealingSubreason2DetailsModelLike[]>(`~api/DealingSubreason2/all`)
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new DealingSubreason2DetailsModel(x);
          });
        })
      );
  }

  listByDealingSubreasons(dealingSubreasonIds: number[]) {
    return this.list().pipe(
      map((list) => {
        return (
          dealingSubreasonIds?.flatMap((id) => {
            return list.filter((x) => x.dealingSubreasonId === id);
          }) ?? []
        );
      })
    );
  }

  create(dto: DealingSubreason2RegisterDTOLike) {
    return this.http
      .post<DealingSubreason2DetailsModelLike>(`~api/DealingSubreason2`, dto)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(dealingSubreason2Id: number, active: boolean) {
    return this.http
      .post<any>(`~api/DealingSubreason2/${dealingSubreason2Id}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }
}
