export const isObject = (target: unknown): target is object => Boolean(target) && typeof target === 'object';
