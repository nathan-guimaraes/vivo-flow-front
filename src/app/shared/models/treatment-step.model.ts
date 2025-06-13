import { TimeSpan } from '../helpers/time-span/time-span';
import {
  ProtocolWithDetailsModel,
  ProtocolWithDetailsModelLike,
  ProtocolModel,
  ProtocolModelLike,
} from './protocol.model';

export enum TreatmentStepStatus {
  Paused = 0,
  InTreatment = 1,
  Done = 2,
}

export interface TreatmentStepModelLike {
  id?: number;
  status?: TreatmentStepStatus;
  protocolId?: number;
  subislandId?: number;
  subisland?: string;
  actionId?: number;
  action?: string;
  createdAt?: Date;
  treatmentTimeSpend?: TimeSpan;
}

export class TreatmentStepModel implements TreatmentStepModelLike {
  id?: number;
  status?: TreatmentStepStatus;
  protocolId?: number;
  subislandId?: number;
  subisland?: string;
  actionId?: number;
  action?: string;
  createdAt?: Date;
  treatmentTimeSpend?: TimeSpan;

  constructor(item?: Partial<TreatmentStepModelLike>) {
    this.id = item?.id;
    this.status = item?.status;
    this.protocolId = item?.protocolId;
    this.subislandId = item?.subislandId;
    this.subisland = item?.subisland;
    this.actionId = item?.actionId;
    this.action = item?.action;
    this.createdAt = !item?.createdAt ? null : new Date(item.createdAt);
    this.treatmentTimeSpend = TimeSpan.parse(item?.treatmentTimeSpend);
  }
}

export interface TreatmentStepWithProtocolModelLike
  extends TreatmentStepModelLike {
  protocol?: ProtocolWithDetailsModelLike;
}

export class TreatmentStepWithProtocolModel
  extends TreatmentStepModel
  implements TreatmentStepWithProtocolModelLike
{
  protocol?: ProtocolWithDetailsModel;

  constructor(item?: Partial<TreatmentStepWithProtocolModelLike>) {
    super(item);
    this.protocol = !item?.protocol
      ? null
      : new ProtocolWithDetailsModel(item.protocol);
  }
}
