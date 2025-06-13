import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CustomerModel } from '../models/customer.model';
import { HttpClient } from '@angular/common/http';
import { PageResults } from '../models/page-regults.model';
import {
  CustomerFilterOptionsDTO,
  CustomerFilterOptionsDTOLike,
} from '../models/dtos/customer-filter.dto';
import { CacheFactoryService, ICacheService } from './cache-factory.service';

@Injectable()
export class CustomersService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('customers');
  }

  listPartnerCodes(): Observable<string[]> {
    return this.cacheService.getCached({
      path: 'partnerCodes',
      source: () => {
        return this.http.get<string[]>(`~api/customers/partnerCodes`);
      },
    });
  }

  listPagedCustomer(
    options?: CustomerFilterOptionsDTOLike
  ): Observable<PageResults<CustomerModel>> {
    const params = new CustomerFilterOptionsDTO(options).toHttpParams();
    return this.http
      .get<PageResults<CustomerModel>>(`~api/customers`, { params })
      .pipe(
        map((res) => {
          res.results = res.results?.map((x) => {
            return new CustomerModel(x);
          });

          return res;
        })
      );
  }
}
