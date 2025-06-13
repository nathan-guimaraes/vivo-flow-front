import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';
import { ProtocolVolumeInfo } from '../models/protocol-volume-info.model';
import { HttpClient } from '@angular/common/http';
import {
  IndicatorsFilterDTO,
  IndicatorsFilterDTOLike,
} from '../models/dtos/indicators-filter.dto';
import { CutoffDateInfo } from '../models/cutoff-date-info.model';
import { ProductivityInfo } from '../models/productivity-info.model';
import { TreatmentTimeInfo } from '../models/treatment-time-info.model';
import { TimeSpan } from '../helpers/time-span/time-span';
import { DisapprovalTreatmentsInfo } from '../models/disapproval-treatments-info.model';

export interface MenuIndicatorsInfoLike {
  protocolsWorkedCount: number;
  protocolsFinishedCount: number;
  productivityRealCount: number;
  productivityReferenceCount: number;
}

export interface MenuProtocolsInfoLike {
  protocolsPendingOutOfSlaCount: number;
  protocolsPendingPausedCount: number;
  protocolsPendingPrioritizedCount: number;
}

export interface MenuUsersInfoLike {
  usersActiveOnlineCount: number;
  usersActivePausedCount: number;
  usersActiveOfflineCount: number;
  newUsersCount: number;
}

@Injectable()
export class DashboardService {
  constructor(private http: HttpClient) {}

  getMenuIndicatorsInfo() {
    return of<MenuIndicatorsInfoLike>({
      protocolsWorkedCount: 200,
      protocolsFinishedCount: 340,
      productivityRealCount: 200,
      productivityReferenceCount: 200,
    }).pipe(delay(2000));
  }

  getMenuProtocolsInfo() {
    return this.http.get<MenuProtocolsInfoLike>(
      `~api/dashboard/brief/protocol`
    );
  }

  getMenuUsersInfo() {
    return this.http.get<MenuUsersInfoLike>(`~api/dashboard/brief/user`);
  }

  getProtocolVolumes(
    filters?: IndicatorsFilterDTOLike
  ): Observable<ProtocolVolumeInfo[]> {
    const params = new IndicatorsFilterDTO(
      filters ?? IndicatorsFilterDTO.default()
    ).toBodyParams();

    return this.http
      .post<ProtocolVolumeInfo[]>(`~api/dashboard/protocolVolumes`, params)
      .pipe(
        map((list) => {
          return list.map((x) => {
            return new ProtocolVolumeInfo(x);
          });
        })
      );
  }

  getCutoffDates(
    filters?: IndicatorsFilterDTOLike
  ): Observable<CutoffDateInfo[]> {
    const params = new IndicatorsFilterDTO(
      filters ?? IndicatorsFilterDTO.default()
    ).toBodyParams();

    return this.http
      .post<CutoffDateInfo[]>(`~api/dashboard/cutoffDate`, params)
      .pipe(
        map((list) => {
          return list.map((x) => {
            return new CutoffDateInfo(x);
          });
        })
      );
  }

  getProductivities(
    filters?: IndicatorsFilterDTOLike
  ): Observable<ProductivityInfo[]> {
    const list = new Array<ProductivityInfo>(10);

    let j = 0;
    for (let i = list.length - 1; i >= 0; --i) {
      list[j++] = new ProductivityInfo({
        totalProtocols: 5 + (i + 2) * 5,
        totalProtocolsRef: 10 + (i + 2) * 5,
        date: (() => {
          const date = new Date();
          date.setDate(date.getDate() - i);

          return date;
        })(),
      });
    }

    return of(list);
  }

  getTreatmentTimes(
    filters?: IndicatorsFilterDTOLike
  ): Observable<TreatmentTimeInfo[]> {
    const params = new IndicatorsFilterDTO(
      filters ?? IndicatorsFilterDTO.default()
    ).toBodyParams();

    return this.http
      .post<TreatmentTimeInfo[]>(`~api/dashboard/serviceTime`, params)
      .pipe(
        map((list) => {
          return list.map((x) => {
            return new TreatmentTimeInfo(x);
          });
        })
      );
  }

  getDisapprovalTreatments(
    filters?: IndicatorsFilterDTOLike
  ): Observable<DisapprovalTreatmentsInfo[]> {
    const params = new IndicatorsFilterDTO(
      filters ?? IndicatorsFilterDTO.default()
    ).toBodyParams();

    return this.http
      .post<TreatmentTimeInfo[]>(`~api/dashboard/disapproval`, params)
      .pipe(
        map((list) => {
          return list.map((x) => {
            return new DisapprovalTreatmentsInfo(x);
          });
        })
      );
  }
}
