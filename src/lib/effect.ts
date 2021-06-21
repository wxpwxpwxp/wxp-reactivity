import { ComputedRef } from './computed.js';
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

const effectStack = [];
let activeEffect: ReactiveEffect | undefined;

let uid = 0;

export function createEffect<T>(fn: () => T): ReactiveEffect<T> {
  const effect = () => {
    enableTrack();
    effectStack.push(effect);
    activeEffect = effect;
    return fn();
  };
  effect.id = uid ++;
  effect.deps = [] as Dep[];

  return effect;
}

let shoudTrack = true;

export function track<T>(target: ComputedRef<T> | Ref<T>): void {
  if (!shoudTrack || activeEffect === undefined) return;

  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

}


function enableTrack() {
  shoudTrack = true;
}

function stopTrack() {
  shoudTrack = false;
}

export function trigger() {

}
