
import { ORIGINAL_KEY, PROXY_KEY } from './constants';
import { createEffect, track, trigger } from './effect';

type Getter<T> = () => T;
type Setter = () => unknown

export interface ComputedOptions<T> {
  get: Getter<T>;
  set: Setter;
}

export interface ComputedRef<T> {
  _isRef: boolean;
  [ORIGINAL_KEY]: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [PROXY_KEY]: any;
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

  let dirty = false;
  const effect = _effect();
  const target = {
    _isRef: true,
    [ORIGINAL_KEY]: effect(),
    [PROXY_KEY]: undefined,
  };
  const targetProxy = new Proxy(target, {
    get(_, key) {
      if (key === PROXY_KEY) {
        if (dirty) {
          target[ORIGINAL_KEY] = effect();
          dirty = false;
        }
        track(target);
        return target[ORIGINAL_KEY];
      }
    },
    set(_, key) {
      if (key === PROXY_KEY) {
        setter();
        trigger(target);
      }
      return true;
    }
  });

  function _effect() {
    return createEffect(getter, ()=> {
      dirty = true;
      targetProxy[PROXY_KEY];
      trigger(target);
    });
  }

  return targetProxy;
}
