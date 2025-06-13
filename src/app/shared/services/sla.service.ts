import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { SlaModel, SlaTimeType } from '../models/sla.model';
import {
  SlaFilterOptionsDTO,
  SlaFilterOptionsDTOLike,
} from '../models/dtos/sla-filter.dto';
import { HttpClient } from '@angular/common/http';
import { PageResults } from '../models/page-regults.model';
import { SlaCreateDTO, SlaUpdateDTO } from '../models/dtos/sla-register.dto';

@Injectable()
export class SlaService {
  constructor(private http: HttpClient) {}

  listPaged(
    options?: SlaFilterOptionsDTOLike
  ): Observable<PageResults<SlaModel>> {
    const params = new SlaFilterOptionsDTO(options).toBodyParams();
    return this.http.post<PageResults<SlaModel>>(`~api/sla/query`, params).pipe(
      map((res) => {
        res.results = res.results?.map((x) => {
          return new SlaModel(x);
        });

        return res;
      })
    );
  }

  create(dto: SlaCreateDTO) {
    return this.http.post<any>(`~api/sla/create`, dto);
  }

  update(slaId: number, dto: SlaUpdateDTO) {
    return this.http.post<any>(`~api/sla/change`, {
      ...dto,
      id: slaId,
    });
  }

  delete(slaId: number) {
    return this.http.delete<any>(`~api/sla/${slaId}`);
  }
}
