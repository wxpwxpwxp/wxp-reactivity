import { ComputedRef } from './computed';
import { Ref } from './ref';

type Dep = Set<ReactiveEffect>
type KeyToDepMap = Map<unknown, Dep>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const targetMap = new WeakMap<any, KeyToDepMap>();

export interface ReactiveEffect<T = unknown> {
  (): T;
  deps: Dep[];
  id: number;
}

const effectStack: ReactiveEffect[] = [];
let activeEffect: ReactiveEffect | undefined;

let uid = 0;

export function createEffect<T>(fn: () => T): ReactiveEffect<T> {
  const effect = () => {
    try {
      enableTrack();
      effectStack.push(effect);
      activeEffect = effect;
      return fn();
    } finally {
      effectStack.pop();
      resetTracking();
      activeEffect = effectStack[effectStack.length - 1];
    }
  };
  effect.id = uid ++;
  effect.deps = [] as Dep[];

  return effect;
}

let shouldTrack = true;

export function track<T>(target: ComputedRef<T> | Ref<T>): void {
  if (!shouldTrack || activeEffect === undefined) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

}

const trackStack: boolean[] = [];

export function pauseTrack(): void {
  trackStack.push(shouldTrack);
  shouldTrack = false;
}

export function enableTrack(): void {
  trackStack.push(shouldTrack);
  shouldTrack = true;
}

export function resetTracking(): void {
  const last = trackStack.pop();
  shouldTrack = last === undefined ? true : last;
}

export function trigger(): void {
  return;
}
