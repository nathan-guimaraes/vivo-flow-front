import { HttpParams } from '@angular/common/http';
import { AbstractOptions } from './abstract-options';
import isObjectLike from 'lodash/isObjectLike';

export abstract class BaseOptions<T, I> extends AbstractOptions<T, I> {
  toHttpParams() {
    let params = new HttpParams();

    this._handleParamsAdapter({
      has(key: string) {
        return params.has(key);
      },

      set(key: string, param: any) {
        if (params.has(key)) {
          params = params.delete(key);
        }

        if (param === undefined) {
          return;
        }

        if (Array.isArray(param)) {
          for (let x of param) {
            if (isObjectLike(x)) {
              x = JSON.stringify(x);
            } else {
              x = x?.toString();
            }
            params = params.append(key, x);
          }
        } else {
          if (isObjectLike(param)) {
            param = JSON.stringify(param);
          } else {
            param = param?.toString();
          }
          params = params.set(key, param);
        }
      },
    });

    return params;
  }

  toBodyParams() {
    const params: Partial<I> = {};

    this._handleParamsAdapter({
      has(key: string) {
        return key in params;
      },

      set(key: string, param: any) {
        if (param === undefined) {
          delete params[key];
          return;
        }

        params[key] = param;
      },
    });

    return params;
  }

  protected abstract _handleParamsAdapter(
    paramsAdapter: ISetParamsAdapter
  ): void;
}

export interface ISetParamsAdapter {
  has(key: string): boolean;
  set(key: string, param: any): void;
}
