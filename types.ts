// deno-lint-ignore no-explicit-any
export type Fn<Params extends readonly any[] = readonly any[], Result = any> =
  (...params: Params) => Result;

export type Maybe<T> = T | null;
export type OrPromise<T> = T | Promise<T>;
