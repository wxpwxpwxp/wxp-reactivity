
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

import { PROXY_KEY, ORIGINAL_KEY } from './constants';
import { track, trigger } from './effect';

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

  return new Proxy(target, {
    get(_, key) {
      if (key === PROXY_KEY) {
        track(target);
        return target[ORIGINAL_KEY];
      }
    },
    set(_, key, newVal) {
      if (key === PROXY_KEY) {
        target[ORIGINAL_KEY] = newVal;
        trigger(target);
      }
      return true;
    }
  });
}
