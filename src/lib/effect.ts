import { ComputedRef } from './computed';
import { Ref } from './ref';

type Dep = Set<ReactiveEffect>
type KeyToDepMap = Map<any, Dep>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const targetDepMap = new WeakMap<any, KeyToDepMap>();


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ReactiveEffect<T = any> {
  (): T;
  deps: Dep[];
  id: number;
  scheduler?: () => void;
}

const effectStack: ReactiveEffect[] = [];
let activeEffect: ReactiveEffect | undefined;

let uid = 0;

export function createEffect<T>(fn: () => T, scheduler: () => void): ReactiveEffect<T> {
  const effect = function reactiveEffect(): unknown {
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
  } as ReactiveEffect;
  effect.id = uid++;
  effect.deps = [] as Dep[];
  effect.scheduler = scheduler;

  return effect;
}

let shouldTrack = true;

export function track<T>(target: ComputedRef<T> | Ref<T> | object, key: string | symbol = 'value'): void {
  if (!shouldTrack || activeEffect === undefined) return;

  let depsMap = targetDepMap.get(target);
  if (!depsMap) {
    targetDepMap.set(target, (depsMap = new Map()));
  }

  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  if (!dep.has(activeEffect)) {
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
  }
}

export function cleanup(effect: ReactiveEffect): void {
  const { deps } = effect;
  if (deps.length) {
    for (let i = 0; i < deps.length; i++) {
      deps[i].delete(effect);
    }
    deps.length = 0;
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

export function trigger<T>(target: ComputedRef<T> | Ref<T> | object, key: string | symbol = 'value'): void {
  const depsMap = targetDepMap.get(target);
  if (!depsMap) {
    return;
  }

  const deps = depsMap.get(key);
  if (!deps) {
    return;
  }

  const run = (effect: ReactiveEffect) => {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect();
    }
  };

  deps.forEach(run);
}
