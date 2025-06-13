import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, defer, map, of, tap } from 'rxjs';
import {
  TowerDetailsModel,
  TowerDetailsModelLike,
  TowerModel,
  TowerModelLike,
} from '../models/tower.model';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { RxEventBus } from '@rxjs-toolkit/eventbus';
import { TowerEvents } from '../constants/tower.constant';

@Injectable()
export class TowersService {
  private cacheService: ICacheService;

  constructor(
    private http: HttpClient,
    cacheFactory: CacheFactoryService,
    private eventbus: RxEventBus
  ) {
    this.cacheService = cacheFactory.getOrCreate('towers');
  }

  list(): Observable<TowerModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<TowerModelLike[]>(`~api/towers`).pipe(
          map((res) => {
            return res.map((x) => {
              return new TowerModel(x);
            });
          })
        );
      },
    });
  }

  listAll(): Observable<TowerDetailsModel[]> {
    return this.http.get<TowerDetailsModelLike[]>(`~api/towers/all`).pipe(
      map((res) => {
        return res.map((x) => {
          return new TowerDetailsModel(x);
        });
      })
    );
  }

  create(name: string) {
    return this.http.post<TowerDetailsModelLike>(`~api/towers`, { name }).pipe(
      tap(() => {
        this.cacheService.clear();
      })
    );
  }

  setActive(towerId: number, active: boolean) {
    return this.http.post<any>(`~api/towers/${towerId}/active`, active).pipe(
      tap(() => {
        this.cacheService.clear();

        this.eventbus.emit(TowerEvents.ACTIVE_CHANGED);
      })
    );
  }
}
