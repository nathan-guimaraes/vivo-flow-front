import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SlaTimeType } from '../models/sla.model';

@Pipe({
  name: 'slaTime',
  standalone: true,
})
export class SlaTimePipe implements PipeTransform {
  constructor(private translateService: TranslateService) {}

  transform(value: number, type: SlaTimeType) {
    const isSingular = value === 1;

    let aux: string;
    switch (type) {
      case SlaTimeType.Hours:
        aux = 'hours';
        break;
      case SlaTimeType.Days:
        aux = 'days';
        break;
      case SlaTimeType.BusinessHours:
        aux = 'business-hours';
        break;
      case SlaTimeType.BusinessDays:
        aux = 'business-days';
        break;
    }

    const suffix = this.translateService.instant(
      'sla.types.' + aux + (isSingular ? '-singular' : '')
    );

    return value + ' ' + suffix;
  }
}
