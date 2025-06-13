import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, delay, map, of, throwError } from 'rxjs';
import { PageResults } from '../models/page-regults.model';
import {
  ProtocolModel,
  ProtocolPriority,
  ProtocolWithTimersModel,
} from '../models/protocol.model';
import {
  ProtocolFilterLike,
  ProtocolFilterOptionsDTO,
  ProtocolFilterOptionsDTOLike,
} from '../models/dtos/protocol-filter.dto';
import { PageOptionsLike } from '../helpers/query-options/page-options';
import { ProtocolsFileLogModel } from '../models/protocols-file-log.model';
import { ProtocolAssignDTOLike } from '../models/dtos/protocol-assign.dto';
import {
  ProtocolFieldChangesDTOLike,
  ProtocolFieldFilterDTO,
  ProtocolFieldFilterDTOLike,
} from '../models/dtos/protocol-field.dto';
import {
  ProtocolFieldDealingModel,
  ProtocolFieldDealingModelLike,
  ProtocolFieldModel,
  ProtocolFieldModelLike,
} from '../models/protocol-field.model';
import { CacheFactoryService, ICacheService } from './cache-factory.service';
import { replace } from 'lodash';
import { ProtocolStatusModel } from '../models/protocol-status.model';

@Injectable()
export class ProtocolsService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('protocols');
  }

  listPaged(
    options?: ProtocolFilterOptionsDTOLike
  ): Observable<PageResults<ProtocolWithTimersModel>> {
    const params = new ProtocolFilterOptionsDTO(options).toBodyParams();

    return this.http
      .post<PageResults<ProtocolWithTimersModel>>(
        `~api/protocols/query`,
        params
      )
      .pipe(
        map((res) => {
          res.results = res.results?.map((x) => {
            return new ProtocolWithTimersModel(x);
          });

          return res;
        })
      );
  }

  listImportsPaged(
    options?: ProtocolFilterOptionsDTOLike
  ): Observable<PageResults<ProtocolsFileLogModel>> {
    const params = new ProtocolFilterOptionsDTO(options).toBodyParams();

    return this.http
      .post<PageResults<ProtocolsFileLogModel>>(
        `~api/protocols/queryimport`,
        params
      )
      .pipe(
        map((res) => {
          res.results = res.results?.map((x) => {
            return new ProtocolsFileLogModel(x);
          });

          return res;
        })
      );
  }

  export(filters?: ProtocolFilterLike) {
    const body = { ...(filters ?? null) };
    return this.http.post(`~api/protocols/export`, body, {
      responseType: 'blob',
    });
  }

  hasDifferentProtocols(filters?: ProtocolFilterLike) {
    const body = { ...(filters ?? null) };
    return this.http
      .post<boolean>(`~api/protocols/validateUpdate`, body)
      .pipe(map((res) => !res));
  }

  assign(dto: ProtocolAssignDTOLike, filters?: ProtocolFilterLike) {
    const body = { ...dto, filterOptions: { ...(filters ?? null) } };
    return this.http.post<boolean>(`~api/protocols/SetAttributes`, body);
  }

  setPriority(protocolId: number, priority: ProtocolPriority) {
    return this.assign({ priority }, { protocolIds: [protocolId] });
  }

  listFields(isManual?: boolean) {
    return this.cacheService
      .getCached({
        path: `~api/protocols/fields`,
        source: (path) => {
          return this.http.get<ProtocolFieldModelLike[]>(path).pipe(
            map((res) => {
              return res.map((x) => {
                return new ProtocolFieldModel(x);
              });
            })
          );
        },
      })
      .pipe(
        map((list) => {
          if (typeof isManual === 'boolean') {
            list = list.filter((x) => x.isManual === isManual);
          }

          return list;
        })
      );
  }

  listFieldsDealingByProtocolId(protocolId: number) {
    return this.http
      .get<ProtocolFieldDealingModelLike[]>(
        `~api/protocols/${protocolId}/fields`
      )
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new ProtocolFieldDealingModel(x);
          });
        })
      );
  }

  listFieldsDealing(filters?: ProtocolFieldFilterDTOLike) {
    const params = new ProtocolFieldFilterDTO(filters).toHttpParams();
    return this.http
      .get<ProtocolFieldDealingModelLike[]>(`~api/protocols/fieldsDealing`, {
        params,
      })
      .pipe(
        map((res) => {
          return res.map((x) => {
            return new ProtocolFieldDealingModel(x);
          });
        })
      );
  }

  setFieldChanges(
    changes: ProtocolFieldChangesDTOLike[],
    filters: ProtocolFieldFilterDTOLike
  ) {
    const body = {
      changes,
      filters: new ProtocolFieldFilterDTO(filters).toBodyParams(),
    };

    return this.http.post<any>(`~api/protocols/fields`, body);
  }

  importProtocols(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post<boolean>(`~api/protocols/import`, formData);
  }

  downloadImportTemplate() {
    return this.http.get(`~api/protocols/downloadModel`, {
      responseType: 'blob',
    });
  }

  downloadProtocolImported(id: number) {
    return this.http
      .get(`~api/protocols/exportImported/${id}`, {
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

  listAllStatuses(): Observable<ProtocolStatusModel[]> {
    return this.cacheService.getCached({
      path: 'statuses',
      source: () => {
        return this.http
          .get<ProtocolStatusModel[]>(`~api/protocols/statuses`)
          .pipe(
            map((res) => {
              return res.map((x) => {
                return new ProtocolStatusModel(x);
              });
            })
          );
      },
    });
  }
}
