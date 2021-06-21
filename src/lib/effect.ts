import { ComputedRef } from './computed';
import { Ref } from './ref';

type Dep = Set<ReactiveEffect>
// type KeyToDepMap = Set<Dep>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const targetDepMap = new WeakMap<any, Dep>();


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

export function track<T>(target: ComputedRef<T> | Ref<T>): void {
  if (!shouldTrack || activeEffect === undefined) return;

  let deps = targetDepMap.get(target);
  if (!deps) {
    targetDepMap.set(target, (deps = new Set()));
  }

  if (!deps.has(activeEffect)) {
    deps.add(activeEffect);
    activeEffect.deps.push(deps);
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

export function trigger<T>(target: ComputedRef<T> | Ref<T>): void {
  const deps = targetDepMap.get(target);

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
