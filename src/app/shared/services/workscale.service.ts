import { Injectable } from '@angular/core';
import { Observable, defer, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import {
  WorkscaleDetailsModel,
  WorkscaleDetailsModelLike,
  WorkscaleModel,
  WorkscaleModelLike,
} from '../models/workscale.model';

@Injectable()
export class WorkscalesService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('workscales');
  }

  list(): Observable<WorkscaleModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<WorkscaleModelLike[]>(`~api/workscales`).pipe(
          map((res) => {
            return res.map((x) => {
              return new WorkscaleModel(x);
            });
          })
        );
      },
    });
  }

  listAll(): Observable<WorkscaleDetailsModel[]> {
    return this.http
      .get<WorkscaleDetailsModelLike[]>(`~api/workscales/all`)
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new WorkscaleDetailsModel(x);
          });
        })
      );
  }

  create(name: string) {
    return this.http
      .post<WorkscaleDetailsModelLike>(`~api/workscales`, { name })
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(workscaleId: number, active: boolean) {
    return this.http
      .post<any>(`~api/workscales/${workscaleId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }
}
