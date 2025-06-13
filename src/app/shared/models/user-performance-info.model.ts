export interface UserPerformanceInfoLike {
  date: Date;
  user: string;
  averageTreatment: number;
}

export class UserPerformanceInfo implements UserPerformanceInfoLike {
  date: Date;
  user: string;
  averageTreatment: number;

  constructor(item?: Partial<UserPerformanceInfoLike>) {
    this.date = !item?.date ? null : new Date(item.date);
    this.user = item?.user;
    this.averageTreatment = item?.averageTreatment;
  }
}
