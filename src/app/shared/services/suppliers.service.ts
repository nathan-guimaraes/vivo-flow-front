import { Injectable } from '@angular/core';
import { Observable, defer, map, of, tap } from 'rxjs';
import { SupplierDetailsModel, SupplierDetailsModelLike, SupplierModel, SupplierModelLike } from '../models/supplier.model';
import { HttpClient } from '@angular/common/http';
import { CacheFactoryService, ICacheService } from './cache-factory.service';

@Injectable()
export class SuppliersService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('suppliers');
  }

  list(): Observable<SupplierModel[]> {
    return this.cacheService.getCached({
      path: 'list',
      source: () => {
        return this.http.get<SupplierModelLike[]>(`~api/suppliers`).pipe(
          map((res) => {
            return res.map((x) => {
              return new SupplierModel(x);
            });
          })
        );
      },
    });
  }

  listAll(): Observable<SupplierDetailsModel[]> {
    return this.http.get<SupplierDetailsModelLike[]>(`~api/suppliers/all`).pipe(
      map((res) => {
        return res.map((x) => {
          return new SupplierDetailsModel(x);
        });
      })
    );
  }

  create(name: string) {
    return this.http.post<SupplierDetailsModelLike>(`~api/suppliers`, { name }).pipe(
      tap(() => {
        this.cacheService.clear();
      })
    );
  }

  setActive(supplierId: number, active: boolean) {
    return this.http.post<any>(`~api/suppliers/${supplierId}/active`, active).pipe(
      tap(() => {
        this.cacheService.clear();

      })
    );
  }
}
