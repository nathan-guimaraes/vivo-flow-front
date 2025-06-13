import { Injectable } from '@angular/core';
import { NgbTimeAdapter, NgbTimeStruct } from '@ng-bootstrap/ng-bootstrap';
import { TimeSpan } from '../../helpers/time-span/time-span';

@Injectable()
export class TimeAdapter extends NgbTimeAdapter<TimeSpan> {
  override fromModel(value: TimeSpan): NgbTimeStruct {
    if (!value) {
      return null;
    }

    const hour = value.hours;
    const minute = value.minutes;
    const second = value.seconds;

    return {
      hour,
      minute,
      second,
    };
  }

  override toModel(time: NgbTimeStruct): TimeSpan {
    if (!time) {
      return null;
    }

    return TimeSpan.fromTime(time.hour, time.minute, time.second);
  }
}
