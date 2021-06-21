
import { PROXY_KEY } from './constants';
import { createEffect, track } from './effect';

type Getter<T> = () => T;
type Setter = () => unknown

export interface ComputedOptions<T> {
  get: Getter<T>;
  set: Setter;
}

export interface ComputedRef<T> {
  _isRef: boolean;
  _value: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

// eslint-disable-next-line no-unused-vars
export function computed<T>(getter: Getter<T>): ComputedRef<T>
// eslint-disable-next-line no-unused-vars
export function computed<T>(options: ComputedOptions<T>): ComputedRef<T>
export function computed<T>(optionsOrGetter: ComputedOptions<T> | Getter<T>): ComputedRef<T> {
  let getter: Getter<T>, setter: Setter;
  if (typeof optionsOrGetter === 'function') {
    getter = optionsOrGetter;
    setter = () => undefined;
  } else {
    getter = optionsOrGetter.get;
    setter = optionsOrGetter.set;
  }

  const effect = createEffect(getter);
  const target = new Proxy({
    _isRef: true,
    effect: effect,
    _value: undefined as unknown,
    value: undefined
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
