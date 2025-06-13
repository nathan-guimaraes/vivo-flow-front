import remove from 'lodash/remove';
import { ExtractExpr, ItemExprUtils } from './item-expr.utils';

export interface EditsOperationsLike<T = any, K = T> {
  adds?: Array<T>;
  addsIndex?: number;
  updates?: Array<T>;
  deletes?: Array<K>;
}

export interface ChangesLike<T> {
  adds?: T[];
  updates?: T[];
}

export interface EditsResultLike<T = any> extends ChangesLike<T> {
  deletes?: T[];
}

function sameFn<T>(item: T): T {
  return item;
}

export class ArrayUtils {
  static move<T>(array: T[], sourceIndex: number, targetIndex: number): T[] {
    if (sourceIndex !== targetIndex) {
      let aux = array[sourceIndex];
      let aux2: T;
      let aux3: T;

      let i = targetIndex;
      if (sourceIndex < targetIndex) {
        while (i >= sourceIndex) {
          aux2 = array[i];
          array[i] = aux3;
          aux3 = aux2;
          --i;
        }
      } else {
        while (i <= sourceIndex) {
          aux2 = array[i];
          array[i] = aux3;
          aux3 = aux2;
          ++i;
        }
      }

      array[targetIndex] = aux;
    }

    return array;
  }

  static addInIndexOrUpdate<T>(
    array: T[],
    item: T,
    index: number,
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean
  ): ChangesLike<T> {
    return ArrayUtils.addInIndexOrUpdateRange(
      array,
      [item],
      index,
      keyExtractor,
      updater,
      canUpdateFn
    );
  }

  static addInIndexOrUpdateRange<T>(
    array: T[],
    items: T[],
    index: number,
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean
  ): ChangesLike<T> {
    const { adds, updates } = ArrayUtils.applyEdits(
      array,
      { adds: items, addsIndex: index, updates: items },
      keyExtractor,
      updater,
      canUpdateFn
    );

    return { adds, updates };
  }

  static addOrUpdate<T>(
    array: T[],
    item: T,
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean
  ): ChangesLike<T> {
    return ArrayUtils.addOrUpdateRange(
      array,
      [item],
      keyExtractor,
      updater,
      canUpdateFn
    );
  }

  static addOrUpdateRange<T>(
    array: T[],
    items: T[],
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean
  ): ChangesLike<T> {
    const { adds, updates } = ArrayUtils.applyEdits(
      array,
      { adds: items, updates: items },
      keyExtractor,
      updater,
      canUpdateFn
    );

    return { adds, updates };
  }

  static addRangeInIndex<T>(
    array: T[],
    items: T[],
    index: number,
    keyExtractor?: ExtractExpr<T>
  ): T[] {
    const { adds } = ArrayUtils.applyEdits(
      array,
      { adds: items, addsIndex: index },
      keyExtractor
    );

    return adds;
  }

  static addInIndex<T>(
    array: T[],
    item: T,
    index: number,
    keyExtractor?: ExtractExpr<T>
  ): boolean {
    const adds = ArrayUtils.addRangeInIndex(array, [item], index, keyExtractor);
    return adds?.length > 0;
  }

  static add<T>(array: T[], item: T, keyExtractor?: ExtractExpr<T>): boolean {
    const adds = ArrayUtils.addRange(array, [item], keyExtractor);
    return adds?.length > 0;
  }

  static addRange<T>(
    array: T[],
    items: T[],
    keyExtractor?: ExtractExpr<T>
  ): T[] {
    const { adds } = ArrayUtils.applyEdits(
      array,
      { adds: items },
      keyExtractor
    );

    return adds;
  }

  static update<T>(
    array: T[],
    item: T,
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean
  ): boolean {
    const updates = ArrayUtils.updateRange(
      array,
      [item],
      keyExtractor,
      updater,
      canUpdateFn
    );
    return updates?.length > 0;
  }

  static updateRange<T>(
    array: T[],
    items: T[],
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean
  ): T[] {
    const { updates } = ArrayUtils.applyEdits(
      array,
      { updates: items },
      keyExtractor,
      updater,
      canUpdateFn
    );

    return updates;
  }

  static removeItem<T>(items: T[], item: T, keyExtractor?: ExtractExpr<T>) {
    const results = ArrayUtils.removeItems(items, [item], keyExtractor);
    return results.length > 0;
  }

  static removeItems<T>(
    items: T[],
    itemsToRemoved: T[],
    keyExtractor?: ExtractExpr<T>
  ): T[] {
    if (!keyExtractor) {
      keyExtractor = sameFn;
    }

    return ArrayUtils.removeItemsByKeys(
      items,
      itemsToRemoved.map((item, index) =>
        ItemExprUtils.extractValue(item, index, keyExtractor)
      ),
      keyExtractor
    );
  }

  static removeItemsByKey<T, K = any>(
    items: T[],
    key: K,
    keyExtractor?: ExtractExpr<T>
  ) {
    return ArrayUtils.removeItemsByKeys(items, [key], keyExtractor);
  }

  static removeItemsByKeys<T, K = any>(
    items: T[],
    keysToRemoved: K[],
    keyExtractor: ExtractExpr<T>
  ): T[] {
    if (!keyExtractor) {
      keyExtractor = sameFn;
    }

    const keySet = keysToRemoved.reduce((acc, key) => {
      acc.add(key);
      return acc;
    }, new Set());
    const results = ArrayUtils.removeItemsBy(items, (x, index) =>
      keySet.has(ItemExprUtils.extractValue(x, index, keyExtractor))
    );
    return results;
  }

  static removeItemsBy<T>(
    items: T[],
    predicate: (item: T, index: number) => boolean
  ): T[] {
    const results = remove(items, predicate);
    return results;
  }

  static applyEdits<T>(
    items: T[],
    edits: EditsOperationsLike<T, any>,
    keyExtractor?: ExtractExpr<T>,
    updater?: (newItem: T, oldItem: T) => T,
    canUpdateFn?: (newItem: T, oldItem: T) => boolean
  ): EditsResultLike<T> {
    if (!keyExtractor) {
      keyExtractor = sameFn;
    }

    let addsHolderList = ArrayUtils.uniqBy(
      edits?.adds?.map((item, index) => {
        return {
          key: ItemExprUtils.extractValue(item, index, keyExtractor),
          item,
        };
      }),
      (x) => x.key
    );
    let updates = edits?.updates?.map((item, index) => {
      return {
        key: ItemExprUtils.extractValue(item, index, keyExtractor),
        item,
      };
    });
    let deleteKeys = edits?.deletes;

    let deletedItems: T[];

    if (deleteKeys?.length) {
      deletedItems = ArrayUtils.removeItemsByKeys(
        items,
        deleteKeys,
        keyExtractor
      );
    }

    const itemsKeyedMap = !(updates?.length || addsHolderList?.length)
      ? null
      : items.reduce((acc, item, index) => {
          acc.set(ItemExprUtils.extractValue(item, index, keyExtractor), {
            item,
            index,
          });
          return acc;
        }, new Map());

    let itemsUpdated;

    if (updates?.length) {
      updater = updater ?? sameFn;
      canUpdateFn = canUpdateFn ?? (() => true);

      const itemsUpdatedKeyedMap = new Map();

      let newItemKeyed;
      let itemKeyed;
      let item;
      for (let i = 0; i < updates.length; ++i) {
        newItemKeyed = updates[i];
        itemKeyed = itemsKeyedMap.get(newItemKeyed.key);
        if (itemKeyed && canUpdateFn(newItemKeyed.item, itemKeyed.item)) {
          item = updater(newItemKeyed.item, itemKeyed.item);
          items[itemKeyed.index] = item;
          itemKeyed.item = item;

          itemsUpdatedKeyedMap.set(newItemKeyed.key, item);
        }
      }

      itemsUpdated = Array.from(itemsUpdatedKeyedMap, ([, item]) => item);
    }

    let adds: T[];
    if (addsHolderList?.length) {
      adds = addsHolderList
        .filter((x) => !itemsKeyedMap.has(x.key))
        .map((x) => x.item);

      if (adds.length) {
        const index = edits.addsIndex ?? items.length;
        items.splice(index, 0, ...adds);
      }
    }

    return {
      adds: adds ?? [],
      updates: itemsUpdated ?? [],
      deletes: deletedItems ?? [],
    };
  }

  static uniqBy<T>(items: T[], keyExtractor: ExtractExpr<T>): T[] {
    if (items) {
      keyExtractor = keyExtractor ?? sameFn;

      const keySet = new Set();
      const list = new Array<T>();

      let key;
      let item;
      for (let i = 0; i < items.length; ++i) {
        item = items[i];
        key = ItemExprUtils.extractValue(item, i, keyExtractor);

        if (!keySet.has(key)) {
          list.push(item);
          keySet.add(key);
        }
      }

      return list;
    } else {
      return null;
    }
  }

  static groupBy<T, K>(
    items: T[],
    keyExtractor: ExtractExpr<T, K>
  ): Map<K, T[]> {
    if (items) {
      const groupMap = new Map<K, T[]>();

      let key;
      let item;
      let list: Array<T>;
      for (let i = 0; i < items.length; ++i) {
        item = items[i];
        key = ItemExprUtils.extractValue(item, i, keyExtractor);

        if (groupMap.has(key)) {
          list = groupMap.get(key);
        } else {
          list = [];
          groupMap.set(key, list);
        }

        list.push(item);
      }

      return groupMap;
    } else {
      return null;
    }
  }
}
