import { HttpParams } from '@angular/common/http';
import cloneDeep from 'lodash/cloneDeep';
import { ICloneable } from '../interfaces';

export abstract class AbstractOptions<T, I> implements ICloneable<T> {
  constructor(options?: Partial<I>) {
    this.reset(options);
  }

  patch(options: Partial<I>) {
    const keys = Object.keys(options);
    for (let key of keys) {
      this.patchByKey(key as any, options[key]);
    }

    return this;
  }

  patchByKey(key: keyof I, value: any) {
    if (key in this) {
      this[key as any] = value;
    }

    return this;
  }

  clone(): T {
    return cloneDeep(this) as any;
  }

  abstract reset(options?: Partial<I>): void;

  abstract toHttpParams(): HttpParams;
  abstract toBodyParams(): Partial<I>;
}
