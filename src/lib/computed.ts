
import { PROXY_KEY } from './constants.js';
import { createEffect, track } from './effect.js';

export interface ComputedOptions<T> {
  getter: () => T;
  setter: () => unknown;
}

export interface ComputedRef<T> {
  _isRef: boolean;
  _value: T;
}

export function computed<T>({ getter, setter }: ComputedOptions<T>): ComputedRef<T> {
  const effect = createEffect(getter);
  const target = new Proxy({
    _isRef: true,
    effect: effect,
    _value: undefined as unknown
  } as ComputedRef<T>, {
    get(target, key) {
      if (key === PROXY_KEY) {
        target._value = effect();
        track(target);
        return getter();
      }
    },
    set(target, key) {
      if (key === PROXY_KEY)
        setter();
      return true;
    }
  });

  return target;
}
