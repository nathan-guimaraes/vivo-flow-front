import isEqualWith from 'lodash/isEqualWith';
import isObject from 'lodash/isObject';
import isPlainObject from 'lodash/isPlainObject';
import cloneDeepWith from 'lodash/cloneDeepWith';
import merge from 'lodash/merge';

declare interface Type<T> extends Function {
  new (...args: any[]): T;
}

export class ObjectUtils {
  static merge(obj: any, ...otherArgs: any[]) {
    return merge(obj, ...otherArgs);
  }

  static clone<T>(obj: T): T {
    let cloned: T;

    if (isPlainObject(obj) && typeof (obj as any).clone !== 'function') {
      const descriptors = Object.getOwnPropertyDescriptors(obj);

      Object.keys(descriptors).forEach((key) => {
        const descriptor = descriptors[key];
        if (typeof descriptor.value === 'undefined') {
          return;
        }

        descriptor.value = ObjectUtils.clone(descriptor.value);
      });

      cloned = Object.create(Object.getPrototypeOf(obj), descriptors);
    } else {
      cloned = cloneDeepWith(obj, customCloneFn);
    }

    return cloned;
  }

  static notEquals(a, b) {
    return !ObjectUtils.equals(a, b);
  }

  static equals(a, b) {
    if (a === b) {
      return true;
    }

    return isEqualWith(a, b, (a2, b2) => {
      if (a2 !== a || b2 !== b) {
        return customEqualsFn(a2, b2);
      }
    });
  }

  static equalsByFields<T>(a: T, b: T, fields: Array<keyof T>): boolean {
    if (a === b) {
      return true;
    }

    if (!a || !b) {
      return false;
    }

    let v1, v2;

    let total = fields.length;
    let field;
    for (let i = 0; i < total; ++i) {
      field = fields[i];
      v1 = a[field];
      v2 = b[field];

      if (!ObjectUtils.equals(v1, v2)) {
        return false;
      }
    }

    return true;
  }
}

function customCloneFn(item) {
  if (typeof item?.clone === 'function') {
    return item.clone();
  }
}

function customEqualsFn(a2, b2) {
  if (!Array.isArray(a2) || !Array.isArray(b2)) {
    const aIsObject: boolean = isObject(a2);
    if (aIsObject && typeof a2.equals === 'function') {
      return a2.equals(b2);
    }

    const bIsObject: boolean = isObject(b2);
    if (bIsObject && typeof b2.equals === 'function') {
      return b2.equals(a2);
    }
  }
}
