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

export type Result <T = void, E extends Error = Error> = T | E;

/**
 * Ensures that a value is an instance of `Error`
 * 
 * If the value is not already one, a new error is created, and the value
 * is assigned to its "detail" property
 */
export function getError (value: unknown): Error {
  return value instanceof Error ? value
    : new ErrorWithDetail(value, '(See "detail" property)');
}

export function isError <T>(value: T): value is T & Error {
  return value instanceof Error;
}

export function assertNotError <T>(value: T): asserts value is Exclude<T, Error> {
  if (value instanceof Error) throw value;
}
