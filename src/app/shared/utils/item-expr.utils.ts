import lodashGet from 'lodash/get';

export type ExtractExprFn<T = any, K = any> = (item: T, index: number) => K;

export type ExtractExpr<T = any, K = any> =
  | string
  | keyof T
  | ExtractExprFn<T, K>;

interface TrackByFunction<T> {
  /**
   * @param index The index of the item within the iterable.
   * @param item The item in the iterable.
   */
  <U extends T>(index: number, item: T & U): any;
}

export class ItemExprUtils {
  static extractValue<T = any>(
    item: T,
    index: number,
    valueExpr?: ExtractExpr<T>
  ) {
    if (valueExpr) {
      let aux;
      if (typeof valueExpr === 'function') {
        aux = valueExpr(item, index);
      } else {
        aux = !item ? null : lodashGet(item, valueExpr);
      }

      return aux;
    }

    return item;
  }

  static trackByFunction<T, K = any>(
    keyExpr: ExtractExpr<T, K>
  ): TrackByFunction<T> {
    return (index: number, item: T) => {
      const key = this.extractValue(item, index, keyExpr);
      return key;
    };
  }
}
