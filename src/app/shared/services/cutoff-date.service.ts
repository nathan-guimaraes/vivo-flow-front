import { Injectable } from '@angular/core';
import {
  PageOptions,
  PageOptionsLike,
} from '../helpers/query-options/page-options';
import { Observable, delay, map, of } from 'rxjs';
import { CutoffDateModel } from '../models/cutoff-date.model';
import { PageResults } from '../models/page-regults.model';
import { HttpClient } from '@angular/common/http';
import { CutoffDateRegisterDTOLike } from '../models/dtos/cutoff-date-register.dto';

@Injectable()
export class CutoffDateService {
  constructor(private http: HttpClient) {}

  listPaged(
    options?: PageOptionsLike
  ): Observable<PageResults<CutoffDateModel>> {
    const params = new PageOptions(options).toBodyParams();

    return this.http
      .post<PageResults<CutoffDateModel>>(`~api/CutoffDates/query`, params)
      .pipe(
        map((res) => {
          res.results = res.results?.map((x) => {
            return new CutoffDateModel(x);
          });
          return res;
        })
      );
  }

  create(dto: CutoffDateRegisterDTOLike) {
    return this.http.post(`~api/CutoffDates`, dto);
  }

  delete(cutoffDateId: number) {
    return this.http.delete(`~api/CutoffDates/${cutoffDateId}`);
  }
}
