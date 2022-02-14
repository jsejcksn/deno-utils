export * from 'https://deno.land/std@0.125.0/testing/asserts.ts';

// deno-lint-ignore no-explicit-any
export class ErrorWithDetail <T = any> extends Error {
  name = 'ErrorWithDetail';
  constructor (readonly detail: T, message?: string) {
    super(message);
  }
}
