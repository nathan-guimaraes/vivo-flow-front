export enum IndicatorSLA {
  Normal = 1,
  Warning = 2,
  Danger = 3,
}

export enum SlaTimeType {
  Hours = 1,
  Days = 2,
  BusinessHours = 3,
  BusinessDays = 4,
}

export interface SlaModelLike {
  id: number;
  time: number;
  type: SlaTimeType;
  tower: string;
  island: string;
  subisland: string;
  subject: string;
  negotiationType: string;
  product: string;
  segment: string;
}

export class SlaModel implements SlaModelLike {
  id: number;
  time: number;
  type: SlaTimeType;
  tower: string;
  island: string;
  subisland: string;
  subject: string;
  negotiationType: string;
  product: string;
  segment: string;

  constructor(item?: Partial<SlaModelLike>) {
    this.id = item?.id;
    this.time = item?.time;
    this.type = item?.type;
    this.tower = item?.tower;
    this.island = item?.island;
    this.subisland = item?.subisland;
    this.subject = item?.subject;
    this.negotiationType = item?.negotiationType;
    this.product = item?.product;
    this.segment = item?.segment;
  }
}
