import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, defer, map, of, tap } from 'rxjs';
import {
  NegotiationTypeDetailsModel,
  NegotiationTypeDetailsModelLike,
  NegotiationTypeModel,
  NegotiationTypeModelLike,
} from '../models/negotiation-type.model';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { NegotiationTypeRegisterDTOLike } from '../models/dtos/negotiation-type-register.dto';
import { TowerEvents } from '../constants/tower.constant';
import { RxEventBus } from '@rxjs-toolkit/eventbus';

@Injectable()
export class NegotiationTypesService implements OnDestroy {
  private cacheService: ICacheService;

  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    cacheFactory: CacheFactoryService,
    private eventbus: RxEventBus
  ) {
    this.cacheService = cacheFactory.getOrCreate('NegotiationTypes');

    this.subscription = this.eventbus
      .on(TowerEvents.ACTIVE_CHANGED)
      .subscribe(() => {
        this.cacheService.clear();
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  list(): Observable<NegotiationTypeModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http
          .get<NegotiationTypeModelLike[]>(`~api/NegotiationTypes`)
          .pipe(
            map((res) => {
              return res.map((x) => {
                return new NegotiationTypeModel(x);
              });
            })
          );
      },
    });
  }

  listAll(): Observable<NegotiationTypeDetailsModel[]> {
    return this.http
      .get<NegotiationTypeDetailsModelLike[]>(`~api/NegotiationTypes/all`)
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new NegotiationTypeDetailsModel(x);
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

  create(dto: NegotiationTypeRegisterDTOLike) {
    return this.http
      .post<NegotiationTypeDetailsModelLike>(`~api/NegotiationTypes`, dto)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(negotiationTypeId: number, active: boolean) {
    return this.http
      .post<any>(`~api/NegotiationTypes/${negotiationTypeId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }
}
