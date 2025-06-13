import { Injectable } from '@angular/core';

@Injectable()
export class DateConfig {
  private _type: 'date' | 'monthYear' = 'date';

  set type(value) {
    if (this._type !== value) {
      this._type = value;
    }
  }

  get type() {
    return this._type;
  }

  get dateFormat() {
    switch (this.type) {
      case 'monthYear':
        return 'MM/YYYY';
      case 'date':
      default:
        return 'DD/MM/YYYY';
    }
  }

  get dateMask() {
    switch (this.type) {
      case 'monthYear':
        return '00/0000';
      case 'date':
      default:
        return '00/00/0000';
    }
  }

  get dateInputMask() {
    switch (this.type) {
      case 'monthYear':
        return 'M0/0000';
      case 'date':
      default:
        return 'd0/M0/0000';
    }
  }

  handleDate(date: Date) {
    if (!date) {
      return null;
    }

    date = new Date(date);
    date.setHours(0);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);

    switch (this.type) {
      case 'monthYear':
        date = new Date(date);
        date.setDate(1);
        return date;
      case 'date':
      default:
        return date;
    }
  }
}
