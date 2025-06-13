import { TimeSpan } from './time-span';

export interface TimeIntervalLike {
  startHour?: TimeSpan;
  endHour?: TimeSpan;
}

export class TimeInterval implements TimeIntervalLike {
  startHour?: TimeSpan;
  endHour?: TimeSpan;

  constructor(item?: TimeIntervalLike) {
    this.startHour = TimeSpan.parse(item?.startHour);
    this.endHour = TimeSpan.parse(item?.endHour);
  }

  static parse(item: TimeIntervalLike) {
    if (item && item.startHour && item.endHour) {
      return new TimeInterval(item);
    }

    return null;
  }

  clone() {
    return new TimeInterval(this);
  }

  toString() {
    return this.startHour?.toString() + ' às ' + this.endHour?.toString();
  }
}
