import { Injectable } from '@angular/core';
import { FlowModel } from '../models/flow.model';
import { Observable, delay, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { FlowDownloadRegisterDTOLike } from 'src/app/shared/models/dtos/flow-download-register.dto';
import { PageResults } from 'src/app/shared/models/page-regults.model';
import {
  FlowFilterOptionsDTO,
  FlowFilterOptionsDTOLike,
} from 'src/app/shared/models/dtos/flow-filter.dto';

@Injectable()
export class FlowService {
  constructor(private http: HttpClient) {}

  listPaged(
    options?: FlowFilterOptionsDTOLike
  ): Observable<PageResults<FlowModel>> {
    const params = new FlowFilterOptionsDTO(options).toBodyParams();

    return this.http
      .post<PageResults<FlowModel>>(`~api/serviceFlow/query`, params)
      .pipe(
        map((res) => {
          res.results = res.results?.map((x) => {
            return new FlowModel(x);
          });
          return res;
        })
      );
  }

  downloadImportTemplate(filters: FlowDownloadRegisterDTOLike) {
    const body = { ...(filters ?? null) };
    return this.http.post(`~api/serviceFlow/download`, body, {
      responseType: 'blob',
    });
  }

  downloadFlow(id: number) {
    return this.http
      .get(`~api/serviceFlow/export/${id}`, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response) => {
          const contentDispositionHeader = response.headers.get(
            'Content-Disposition'
          );
          const fileNameRegex = /filename="?([^";]+)\.xlsx"?/;
          const matches = fileNameRegex.exec(contentDispositionHeader);
          let fileName =
            matches && matches[1] ? matches[1] : `fluxo-${Date.now()}.xlsx`;
          fileName = fileName.replace(/\./g, '_');
          return { blob: response.body, name: fileName };
        })
      );
  }

  importFlow(filters: FlowDownloadRegisterDTOLike, file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('towerId', String(filters.towerId));

    const fields: Array<keyof FlowDownloadRegisterDTOLike> = [
      'negotiationTypeIds',
      'productIds',
      'segmentIds',
    ];

    for (const field of fields) {
      let list = filters[field];
      if (!Array.isArray(list)) {
        list = [list];
      }

      for (let value of list) {
        formData.append(field, String(value));
      }
    }

    return this.http.post<boolean>(`~api/serviceFlow/import`, formData);
  }
}
