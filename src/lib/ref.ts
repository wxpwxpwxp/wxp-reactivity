
// class RefImpl<T> {
//   private _value: T

//   // eslint-disable-next-line camelcase
//   public readonly __is_ref__ = true

//   constructor(private _rawValue: T) {
//     this._value = _rawValue;
//   }

//   get value() {
//     return this._value;
//   }

//   set value(newVal) {
//     this._value = newVal;
//   }
// }

import { isObject } from '../shared';
import { PROXY_KEY, ORIGINAL_KEY } from './constants';
import { track, trigger } from './effect';
import { reactive, ReactiveFlags, Target } from './reactive';

export interface Ref<T> {
  [ORIGINAL_KEY]: T;
  _isRef: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [PROXY_KEY]: any;
}

export function ref<T>(value: T): Ref<T> {
  const target = {
    [ORIGINAL_KEY]: value,
    _isRef: true,
    [PROXY_KEY]: undefined
  };

  if (isObject(value) && !(value as Target)[ReactiveFlags.IS_REACTIVE]) {
    return ref(reactive(value));
  }

  return new Proxy(target, {
    get(_, key, receiver) {
      if (key === PROXY_KEY) {
        track(target);
        return target[ORIGINAL_KEY];
      }
      const res = Reflect.get(_, key, receiver);
      if (res) return res;
    },
    set(_, key, newVal, receiver) {
      let result;
      if (key === PROXY_KEY) {
        target[ORIGINAL_KEY] = newVal;

        result = Reflect.set(_, key, newVal, receiver);
        trigger(target);
      }
      return result ?? true;
    }
  });
}

export function isRef<T>(ref: Ref<T> | unknown): boolean {
  return Boolean(ref && (ref as Ref<T>)._isRef);
}

export function unref<T>(ref: T): T extends Ref<infer V> ? V : T {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return isRef(ref) ? (ref as any).value : ref;
}
