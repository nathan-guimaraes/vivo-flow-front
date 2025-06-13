import { Injectable } from '@angular/core';
import { PageOptionsLike } from '../helpers/query-options/page-options';
import { Observable, delay, map, of } from 'rxjs';
import { ProductivityModel } from '../models/productivity.model';
import {
  ProductivityFilterOptionsDTO,
  ProductivityFilterOptionsDTOLike,
} from '../models/dtos/productivity-filter.dto';
import { HttpClient } from '@angular/common/http';
import { PageResults } from '../models/page-regults.model';
import { ProductivityCreateDTO } from '../models/dtos/productivity-register.dto';

@Injectable()
export class ProductivityService {
  constructor(private http: HttpClient) {}

  listPaged(
    options?: ProductivityFilterOptionsDTOLike
  ): Observable<PageResults<ProductivityModel>> {
    const params = new ProductivityFilterOptionsDTO(options).toBodyParams();
    return this.http
      .post<PageResults<ProductivityModel>>(`~api/productivities/query`, params)
      .pipe(
        map((res) => {
          res.results = res.results?.map((x) => {
            return new ProductivityModel(x);
          });

          return res;
        })
      );
  }

  create(dto: ProductivityCreateDTO) {
    return this.http.post<any>(`~api/productivities/create`, dto);
  }

  update(productivityId: number, quantityProductivity: number) {
    return this.http.post<any>(`~api/productivities/change`, {
      id: productivityId,
      quantityProductivity,
    });
  }

  delete(productivityId: number) {
    return this.http.delete<any>(`~api/productivities/${productivityId}`);
  }
}
