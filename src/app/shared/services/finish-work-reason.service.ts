import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { FinishWorkReasonModelLike } from '../models/finish-work-reason.model';

@Injectable()
export class FinishWorkReasonService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('finish-work-reason');
  }

  list(): Observable<FinishWorkReasonModelLike[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<FinishWorkReasonModelLike[]>(
          `~api/FinishWorkReasons/all`
        );
      },
    });
  }
}
