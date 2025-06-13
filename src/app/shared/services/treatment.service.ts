import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WorkStatusOption } from '../models/user.model';
import { ProtocolModel, ProtocolModelLike } from '../models/protocol.model';
import { map } from 'rxjs';
import { TreatmentPauseReasonType } from '../models/treatment-pause-reason.model';
import {
  PageOptions,
  PageOptionsLike,
} from '../helpers/query-options/page-options';
import { PageResults } from '../models/page-regults.model';
import {
  TreatmentStepWithProtocolModel,
  TreatmentStepWithProtocolModelLike,
} from '../models/treatment-step.model';
import { FinishTreatmentStepDTOLike } from '../models/dtos/treatment-step.dto';
import {
  TreatmentDiagramItemModel,
  TreatmentDiagramItemModelLike,
} from '../models/treatment-diagram.model';

interface JourneyWorkInfoLike {
  name: string;
  workStatus?: WorkStatusOption;
  treatmentsDoneCount: number;
}

@Injectable()
export class TreatmentService {
  constructor(private http: HttpClient) {}

  getWorkInfo() {
    return this.http.get<JourneyWorkInfoLike>(`~api/Treatment/journeyWorkInfo`);
  }

  startWork() {
    return this.http.post(`~api/Treatment/journeyStatus`, {
      status: WorkStatusOption.Acting,
    });
  }

  finishWork(reasonId: number) {
    return this.http.post(`~api/Treatment/journeyStatus`, {
      status: WorkStatusOption.NotActing,
      reason: reasonId,
    });
  }

  getCurrentTreatment() {
    return this.http
      .get<TreatmentStepWithProtocolModelLike>(`~api/Treatment/currentProtocol`)
      .pipe(
        map((res) => {
          return !res ? null : new TreatmentStepWithProtocolModel(res);
        })
      );
  }

  listPagedPausedTreatments(options?: PageOptionsLike) {
    const params = new PageOptions(options).toBodyParams();

    return this.http
      .post<PageResults<TreatmentStepWithProtocolModel>>(
        `~api/Treatment/pausedProtocols`,
        params
      )
      .pipe(
        map((res) => {
          res.results = res.results?.map((x) => {
            return new TreatmentStepWithProtocolModel(x);
          });

          return res;
        })
      );
  }

  countPausedProtocols() {
    return this.listPagedPausedTreatments({ countOnly: true }).pipe(
      map((res) => res.totalCount)
    );
  }

  pauseTreatment(stepId: number, pauseType: TreatmentPauseReasonType) {
    return this.http.put<any>(`~api/Treatment/pause`, {
      stepId,
      pauseType,
    });
  }

  playTreatment(stepId: number) {
    return this.http.put<any>(`~api/Treatment/${stepId}/play`, null);
  }

  finishTreatment(stepId: number, data: FinishTreatmentStepDTOLike) {
    return this.http.put<any>(`~api/Treatment/conclude`, {
      ...data,
      stepId,
    });
  }

  getDiagramData(protocolId: number) {
    return this.http
      .get<TreatmentDiagramItemModelLike[]>(
        `~api/Treatment/diagram/${protocolId}`
      )
      .pipe(
        map((list) => {
          return list.map((x) => {
            return new TreatmentDiagramItemModel(x);
          });
        })
      );
  }
}
