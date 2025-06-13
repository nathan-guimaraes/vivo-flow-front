import {
  TimeInterval,
  TimeIntervalLike,
} from '../helpers/time-span/time-interval';

export enum WorkStatusOption {
  NotActing = 0,
  Acting = 1,
}

export enum UserStatus {
  New = 1,
  Active = 2,
  Inactive = 3,
}

export enum UserProfile {
  Admin = 1,
  Manager = 2,
  TeamVivo = 3,
  Supervisor = 4,
  Operator = 5,
  Consultant = 6,
}

export interface UserStatusModelLike {
  id: UserStatus;
  name: string;
}

export interface UserProfileModelLike {
  id: UserProfile;
  name: string;
}

export interface UserSimpleModelLike {
  id: number;
  name: string;
  login: string;
  profileId: UserProfile;
}

export interface UserModelLike {
  id: number;
  login: string;
  profileId: UserProfile;
  profile: string;
  name: string;
  supervisorId: number;
  supervisor: string;
  workscaleId: number;
  workscale: string;
  workloadId: number;
  workload: string;
  worktime: TimeIntervalLike;
  supplierId: number;
  supplier: string;
  statusId: UserStatus;
  status: string;
  returnedAt: Date;
}

export class UserModel implements UserModelLike {
  id: number;
  login: string;
  profileId: number;
  profile: string;
  name: string;
  supervisorId: number;
  supervisor: string;
  workscaleId: number;
  workscale: string;
  workloadId: number;
  workload: string;
  worktime: TimeInterval;
  supplierId: number;
  supplier: string;
  statusId: UserStatus;
  status: string;
  returnedAt: Date;

  constructor(item?: Partial<UserModelLike>) {
    this.id = item?.id;
    this.login = item?.login;
    this.profileId = item?.profileId;
    this.profile = item?.profile;
    this.name = item?.name;
    this.supervisorId = item?.supervisorId;
    this.supervisor = item?.supervisor;
    this.workscaleId = item?.workscaleId;
    this.workscale = item?.workscale;
    this.workloadId = item?.workloadId;
    this.workload = item?.workload;
    this.worktime = TimeInterval.parse(item?.worktime);
    this.supplierId = item?.supplierId;
    this.supplier = item?.supplier;
    this.statusId = item?.statusId;
    this.status = item?.status;
    this.returnedAt = !item?.returnedAt ? null : new Date(item.returnedAt);
  }
}
