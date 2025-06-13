import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, defer, map, of, tap } from 'rxjs';
import {
  IslandDetailsModel,
  IslandDetailsModelLike,
  IslandModel,
  IslandModelLike,
} from '../models/island.model';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { RxEventBus } from '@rxjs-toolkit/eventbus';
import { TowerEvents } from '../constants/tower.constant';
import { IslandEvents } from '../constants/island.constant';
import { IslandRegisterDTOLike } from '../models/dtos/island-register.dto';

@Injectable()
export class IslandsService implements OnDestroy {
  private cacheService: ICacheService;

  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    cacheFactory: CacheFactoryService,
    private eventbus: RxEventBus
  ) {
    this.cacheService = cacheFactory.getOrCreate('islands');

    this.subscription = this.eventbus
      .on(TowerEvents.ACTIVE_CHANGED)
      .subscribe(() => {
        this.cacheService.clear();

        this.eventbus.emit(IslandEvents.ACTIVE_CHANGED);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  list(): Observable<IslandModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<IslandModelLike[]>(`~api/islands`).pipe(
          map((res) => {
            return res.map((x) => {
              return new IslandModel(x);
            });
          })
        );
      },
    });
  }

  listAll(): Observable<IslandDetailsModel[]> {
    return this.http.get<IslandDetailsModelLike[]>(`~api/islands/all`).pipe(
      map((res) => {
        return res.map((x) => {
          return new IslandDetailsModel(x);
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

  create(dto: IslandRegisterDTOLike) {
    return this.http.post<IslandDetailsModelLike>(`~api/islands`, dto).pipe(
      tap(() => {
        this.cacheService.clear();
      })
    );
  }

  setActive(islandId: number, active: boolean) {
    return this.http.post<any>(`~api/islands/${islandId}/active`, active).pipe(
      tap(() => {
        this.cacheService.clear();

        this.eventbus.emit(IslandEvents.ACTIVE_CHANGED);
      })
    );
  }
}
