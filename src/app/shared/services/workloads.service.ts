import { Injectable } from '@angular/core';
import { Observable, defer, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import {
  WorkloadDetailsModel,
  WorkloadDetailsModelLike,
  WorkloadModel,
  WorkloadModelLike,
} from '../models/workload.model';

@Injectable()
export class WorkloadsService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('workloads');
  }

  list(): Observable<WorkloadModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<WorkloadModelLike[]>(`~api/workloads`).pipe(
          map((res) => {
            return res.map((x) => {
              return new WorkloadModel(x);
            });
          })
        );
      },
    });
  }

  listAll(): Observable<WorkloadDetailsModel[]> {
    return this.http.get<WorkloadDetailsModelLike[]>(`~api/workloads/all`).pipe(
      map((res) => {
        return res.map((x) => {
          return new WorkloadDetailsModel(x);
        });
      })
    );
  }

  create(name: string) {
    return this.http
      .post<WorkloadDetailsModelLike>(`~api/workloads`, { name })
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(workloadId: number, active: boolean) {
    return this.http
      .post<any>(`~api/workloads/${workloadId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }
}
