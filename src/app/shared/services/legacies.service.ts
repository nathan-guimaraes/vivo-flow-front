import { Injectable } from '@angular/core';
import {
  LegacyDetailsModel,
  LegacyDetailsModelLike,
  LegacyModel,
  LegacyModelLike,
} from '../models/legacy.model';
import { map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ICacheService, CacheFactoryService } from './cache-factory.service';

@Injectable()
export class LegaciesService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('legacies');
  }

  list() {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<LegacyModelLike[]>(`~api/legacies`).pipe(
          map((res) => {
            return res.map((x) => {
              return new LegacyModel(x);
            });
          })
        );
      },
    });
  }

  listAll() {
    return this.http.get<LegacyDetailsModelLike[]>(`~api/legacies/all`).pipe(
      map((res) => {
        return res.map((x) => {
          return new LegacyDetailsModel(x);
        });
      })
    );
  }

  create(name: string) {
    return this.http
      .post<LegacyDetailsModelLike>(`~api/legacies`, { name })
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(legacyId: number, active: boolean) {
    return this.http.post<any>(`~api/legacies/${legacyId}/active`, active).pipe(
      tap(() => {
        this.cacheService.clear();
      })
    );
  }
}
