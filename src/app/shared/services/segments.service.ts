import { Injectable } from '@angular/core';
import { Observable, defer, map, of, tap } from 'rxjs';
import {
  SegmentDetailsModel,
  SegmentDetailsModelLike,
  SegmentModel,
  SegmentModelLike,
} from '../models/segment.model';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';

@Injectable()
export class SegmentsService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('segments');
  }

  list(): Observable<SegmentModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<SegmentModelLike[]>(`~api/segments`).pipe(
          map((res) => {
            return res.map((x) => {
              return new SegmentModel(x);
            });
          })
        );
      },
    });
  }

  listAll(): Observable<SegmentDetailsModel[]> {
    return this.http.get<SegmentDetailsModelLike[]>(`~api/segments/all`).pipe(
      map((res) => {
        return res.map((x) => {
          return new SegmentDetailsModel(x);
        });
      })
    );
  }

  create(name: string) {
    return this.http
      .post<SegmentDetailsModelLike>(`~api/segments`, { name })
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(segmentId: number, active: boolean) {
    return this.http
      .post<any>(`~api/segments/${segmentId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }
}
