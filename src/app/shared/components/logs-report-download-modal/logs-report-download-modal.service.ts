import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LogsReportFilterLike } from 'src/app/shared/models/dtos/logs-report-filter.dto';
import {
  LogsReportTypeLike,
  LogsReportTypeModel,
} from 'src/app/shared/models/logs-report-type';
import {
  CacheFactoryService,
  ICacheService,
} from 'src/app/shared/services/cache-factory.service';

@Injectable()
export class LogsReportDownloadModalService {
  private cacheService: ICacheService;

  constructor(private http: HttpClient, cacheFactory: CacheFactoryService) {
    this.cacheService = cacheFactory.getOrCreate('logReport');
  }

  listLogReportTypes(): Observable<LogsReportTypeModel[]> {
    return this.cacheService.getCached({
      path: 'types',
      source: () => {
        return this.http.get<LogsReportTypeLike[]>(`~api/logReport`);
      },
    });
  }

  export(filters?: LogsReportFilterLike) {
    const body = { ...(filters ?? null) };
    return this.http.post(`~api/logReport/export`, body, {
      responseType: 'blob',
    });
  }
}
