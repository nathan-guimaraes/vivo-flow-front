import { TimeSpan } from '../helpers/time-span/time-span';

export interface TreatmentTimeInfoLike {
  date: Date;
  doneProtocols: number;
  doneTime: TimeSpan;
  undoneProtocols: number;
  undoneTime: TimeSpan;
}

export class TreatmentTimeInfo implements TreatmentTimeInfoLike {
  date: Date;
  doneProtocols: number;
  doneTime: TimeSpan;
  undoneProtocols: number;
  undoneTime: TimeSpan;

  constructor(item?: Partial<TreatmentTimeInfoLike>) {
    this.date = !item?.date ? null : new Date(item.date);
    this.doneProtocols = item?.doneProtocols;
    this.doneTime = TimeSpan.parse(item?.doneTime);
    this.undoneProtocols = item?.undoneProtocols;
    this.undoneTime = TimeSpan.parse(item?.undoneTime);
  }
}
