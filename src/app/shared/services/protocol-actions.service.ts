import { Injectable } from '@angular/core';
import { Observable, defer, map, of, tap } from 'rxjs';
import {
  ProtocolActionDetailsModel,
  ProtocolActionDetailsModelLike,
  ProtocolActionModel,
  ProtocolActionModelLike,
} from '../models/protocol-action.model';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';

@Injectable()
export class ProtocolActionsService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('protocolActions');
  }

  listByFlow(protocolId: number): Observable<ProtocolActionModel[]> {
    return this.http
      .get<ProtocolActionModelLike[]>(`~api/protocolActions/${protocolId}`)
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new ProtocolActionModel(x);
          });
        })
      );
  }

  list(): Observable<ProtocolActionModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http
          .get<ProtocolActionModelLike[]>(`~api/protocolActions`)
          .pipe(
            map((res) => {
              return res.map((x) => {
                return new ProtocolActionModel(x);
              });
            })
          );
      },
    });
  }

  listAll(): Observable<ProtocolActionDetailsModel[]> {
    return this.http
      .get<ProtocolActionDetailsModelLike[]>(`~api/protocolActions/all`)
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new ProtocolActionDetailsModel(x);
          });
        })
      );
  }

  create(name: string) {
    return this.http
      .post<ProtocolActionDetailsModelLike>(`~api/protocolActions`, { name })
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }

  setActive(protocolactionId: number, active: boolean) {
    return this.http
      .post<any>(`~api/protocolActions/${protocolactionId}/active`, active)
      .pipe(
        tap(() => {
          this.cacheService.clear();
        })
      );
  }
}
