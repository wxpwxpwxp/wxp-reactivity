import { isObject } from '../shared';
import { mutableHandlers } from './base';

export const enum ReactiveFlags {
  // eslint-disable-next-line no-unused-vars
  IS_REACTIVE = '__v_isReactive',
}
export interface Target {
  [ReactiveFlags.IS_REACTIVE]?: boolean;
}

export function reactive<T>(target: T) {
  if ((target as Target)[ReactiveFlags.IS_REACTIVE]) {
    return target;
  }

  return createReactiveObject(target);
}


function createReactiveObject<T>(target: T) {
  if (isObject(target)) {
    const proxy = new Proxy(
      target,
      mutableHandlers
    );

    return proxy;
  }
  return target;
}
