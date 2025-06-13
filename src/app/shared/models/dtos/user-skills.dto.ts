import { TimeIntervalLike } from "../../helpers/time-span/time-interval";
import { UserStatus } from "../user.model";

export interface UserSkillsDTOLike {
  statusId: UserStatus;
  returnedAt?: Date;
  workscaleId: number;
  workloadId: number;
  worktime: TimeIntervalLike;
  priority: boolean;
  supplierId: number;
  supervisorId: number;
  towerId: number;
  islandId: number;
  subislandId: number;
  subjectId: number;
  negotiationTypeId: number;
  towerIds: number[];
  islandIds: number[];
  subislandIds: number[];
  subjectIds: number[];
  negotiationTypeIds: number[];
  productIds: number[];
  segmentIds: number[];
  customerIds: number[];
}
