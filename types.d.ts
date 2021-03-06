// deno-lint-ignore no-explicit-any
export type Ctor<Params extends readonly any[] = readonly any[], Result = any> =
  new (...params: Params) => Result;

// deno-lint-ignore no-explicit-any
export type Fn<Params extends readonly any[] = readonly any[], Result = any> =
  (...params: Params) => Result;

export type Maybe<T> = T | null;
export type OrPromise<T> = T | Promise<T>;
export type Values<T> = T[keyof T];

/**
 * Returns the type as a single-element tuple:
 * - The element becomes optional if `undefined` is a subtype
 * - The element is omitted if it is assignable to `never`
 */
export type ConditionallyOptionalParameter<T> = (
  undefined extends T ? [value?: T]
  : T extends never ? []
  : [value: T]
);
