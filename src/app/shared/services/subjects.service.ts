import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subscription, defer, map, of, tap } from 'rxjs';
import {
  SubjectDetailsModel,
  SubjectDetailsModelLike,
  SubjectModel,
  SubjectModelLike,
} from '../models/subject.model';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { HttpClient } from '@angular/common/http';
import { RxEventBus } from '@rxjs-toolkit/eventbus';
import { SubislandEvents } from '../constants/subisland.constant';
import { SubjectRegisterDTOLike } from '../models/dtos/subject-register.dto';

@Injectable()
export class SubjectsService implements OnDestroy {
  private cacheService: ICacheService;

  private subscription: Subscription;

  constructor(
    private http: HttpClient,
    cacheFactory: CacheFactoryService,
    private eventbus: RxEventBus
  ) {
    this.cacheService = cacheFactory.getOrCreate('subjects');

    this.subscription = this.eventbus
      .on(SubislandEvents.ACTIVE_CHANGED)
      .subscribe(() => {
        this.cacheService.clear();
      });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  list(): Observable<SubjectModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<SubjectModelLike[]>(`~api/subjects`).pipe(
          map((res) => {
            return res.map((x) => {
              return new SubjectModel(x);
            });
          })
        );
      },
    });
  }

  listAll(): Observable<SubjectDetailsModel[]> {
    return this.http.get<SubjectDetailsModelLike[]>(`~api/subjects/all`).pipe(
      map((res) => {
        return res.map((x) => {
          return new SubjectDetailsModel(x);
        });
      })
    );
  }

  listBySubislands(subislandIds: number[]) {
    return this.list().pipe(
      map((list) => {
        return (
          subislandIds?.flatMap((subislandId) => {
            return list.filter((x) => x.subislandId === subislandId);
          }) ?? []
        );
      })
    );
  }

  create(dto: SubjectRegisterDTOLike) {
    return this.http.post<SubjectDetailsModelLike>(`~api/subjects`, dto).pipe(
      tap(() => {
        this.cacheService.clear();
      })
    );
  }

  setActive(subjectId: number, active: boolean) {
    return this.http
      .post<any>(`~api/subjects/${subjectId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }
}
