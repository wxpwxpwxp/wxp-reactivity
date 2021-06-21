export const log = console.log;

export const error = console.error;

export const warn = console.warn;

export const logObj: typeof console.dir = _ => console.dir(_, { depth: null });

export function blockLog<T>(data: T[] | T, title = 'logger'): void {
  log(`----${title}-----`);
  if (Array.isArray(data)) {
    data.forEach(i => logObj(i));
  } else {
    logObj(data);
  }
  log('----end-----');
}

export function success<T>(data: T[]): void {
  blockLog(data, 'success');
}
