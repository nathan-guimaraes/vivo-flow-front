import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, defer, map, of, tap } from 'rxjs';
import {
  SubislandDetailsModel,
  SubislandDetailsModelLike,
  SubislandModel,
  SubislandModelLike,
} from '../models/subisland.model';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { RxEventBus } from '@rxjs-toolkit/eventbus';
import { IslandEvents } from '../constants/island.constant';
import { SubislandEvents } from '../constants/subisland.constant';
import { SubislandRegisterDTOLike } from '../models/dtos/subisland-register.dto';
import { ProtocolFilterLike } from '../models/dtos/protocol-filter.dto';

@Injectable()
export class SubislandsService implements OnDestroy {
  private cacheService: ICacheService;

  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    cacheFactory: CacheFactoryService,
    private eventbus: RxEventBus
  ) {
    this.cacheService = cacheFactory.getOrCreate('subislands');

    this.subscription = this.eventbus
      .on(IslandEvents.ACTIVE_CHANGED)
      .subscribe(() => {
        this.cacheService.clear();

        this.eventbus.emit(SubislandEvents.ACTIVE_CHANGED);
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  list(): Observable<SubislandModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<SubislandModelLike[]>(`~api/subislands`).pipe(
          map((res) => {
            return res.map((x) => {
              return new SubislandModel(x);
            });
          })
        );
      },
    });
  }

  listAll(): Observable<SubislandDetailsModel[]> {
    return this.http
      .get<SubislandDetailsModelLike[]>(`~api/subislands/all`)
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new SubislandDetailsModel(x);
          });
        })
      );
  }

  listByIslands(islandIds: number[]) {
    return this.list().pipe(
      map((list) => {
        return (
          islandIds?.flatMap((islandId) => {
            return list.filter((x) => x.islandId === islandId);
          }) ?? []
        );
      })
    );
  }

  create(dto: SubislandRegisterDTOLike) {
    return this.http
      .post<SubislandDetailsModelLike>(`~api/subislands`, dto)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(subislandId: number, active: boolean) {
    return this.http
      .post<any>(`~api/subislands/${subislandId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();

          this.eventbus.emit(SubislandEvents.ACTIVE_CHANGED);
        })
      );
  }

  listSubislandsRelatedFlow(
    filters: ProtocolFilterLike
  ): Observable<SubislandModel[]> {
    const body = { ...(filters ?? null) };
    return this.http
      .post<SubislandModelLike[]>(
        `~api/protocols/listSubislandRelatedFlow`,
        body
      )
      .pipe(
        map((list) => {
          return list.map((x) => {
            return new SubislandModel(x);
          });
        })
      );
  }
}
