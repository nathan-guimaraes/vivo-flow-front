import { SlaTimeType } from "../sla.model";

export interface SlaCreateDTO {
  time: number;
  type: SlaTimeType;
  towerId: number;
  islandId: number;
  subislandId: number;
  segmentId: number;
  subjectId: number;
  negotiationTypeId: number;
  productId: number;
}

export interface SlaUpdateDTO {
  time: number;
  type: SlaTimeType;
}
