import { Inject, Injectable } from '@angular/core';
import {
  NgbDateParserFormatter,
  NgbDateStruct,
} from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { DateConfig } from './date-config';

function isValidDate(d: Date) {
  return d instanceof Date && !isNaN(d as any);
}

@Injectable()
export class MomentDateParserFormatter extends NgbDateParserFormatter {
  constructor(private config: DateConfig) {
    super();
  }

  override parse(value: string): NgbDateStruct {
    const date = moment(value, this.config.dateFormat).toDate();
    if (!isValidDate(date)) {
      return null;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return {
      year,
      month,
      day,
    };
  }

  override format(date: NgbDateStruct): string {
    if (date?.month) {
      --date.month;
    }

    const aux = moment(date).format(this.config.dateFormat);
    return aux;
  }
}
