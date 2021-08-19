import { isObject } from '../shared';
import { track, trigger } from './effect';
import { reactive, ReactiveFlags } from './reactive';
import { isRef, unref } from './ref';

const createGetter = (): any => {
  return function get(target: object, key: string | symbol, receiver: any) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return true;
    }

    const res = Reflect.get(target, key, receiver);

    track(target, key);

    if (isRef(res)) {
      return unref(res);
    }

    if (isObject(res)) {
      return reactive(res);
    }

    return res;
  };
};

const createSetter = (): any => {
  return function set(target: object, key: string | symbol, value: unknown, receiver: object) {
    const result = Reflect.set(target, key, value, receiver);
    trigger(target, key);
    return result;
  };
};

const get = createGetter();
const set = createSetter();


export const mutableHandlers = {
  get,
  set
};
