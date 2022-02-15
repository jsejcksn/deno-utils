export type Result <T = void, E extends Error = Error> = T | E;

export function getError (value: unknown): Error {
  return value instanceof Error ? value
    : new Error('(See "cause" property)', {cause: value});
}

export function isError <T>(value: T): value is T & Error {
  return value instanceof Error;
}

export function assertNotError <T>(value: T): asserts value is Exclude<T, Error> {
  if (value instanceof Error) throw value;
}

/**
 * Base error class for including generic data structures on
 * the "detail" property (similar to CustomEvent)
*/
// deno-lint-ignore no-explicit-any
export class ErrorWithDetail <T = any> extends Error {
  name = 'ErrorWithDetail';
  constructor (readonly detail: T, ...params: ConstructorParameters<typeof Error>) {
    super(...params);
  }
}
