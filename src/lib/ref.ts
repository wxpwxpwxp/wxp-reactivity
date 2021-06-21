
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

import { PROXY_KEY, ORIGINAL_KEY } from './constants.js';

export interface Ref<T> {
  _value: T;
  _isRef: boolean;
}

export function ref<T>(value: T): Ref<T> {
  const target = new Proxy({
    _value: value,
    _isRef: true
  }, {
    get(target, key) {
      if (key === PROXY_KEY)
        return target[ORIGINAL_KEY];
    },
    set(target, key, newVal) {
      if (key === PROXY_KEY)
        target[ORIGINAL_KEY] = newVal;
      return true;
    }
  });
  return target;
}
