import {assert, assertStrictEquals, assertThrows} from './test_deps.ts';
import {
  assertNotError,
  ErrorWithDetail,
  getError,
  isError,
} from './exceptions.ts';

Deno.test('ErrorWithDetail', async (ctx) => {
  await ctx.step('is instanceof Error', () => {
    assert(new ErrorWithDetail(undefined) instanceof Error);
    const cause = new Error();
    assertStrictEquals(
      new ErrorWithDetail(undefined, undefined, {cause}).cause,
      cause,
    );
  });

  await ctx.step('sets expected properties', () => {
    const msg = 'msg';
    const cause = new Error(msg);
    const detail = {msg};
    const err = new ErrorWithDetail(detail, msg, {cause});
    assertStrictEquals(err.message, msg);
    assertStrictEquals(err.detail, detail);
    assertStrictEquals(err.cause, cause);
  });
});

Deno.test('assertNotError', async (ctx) => {
  await ctx.step('throws Error argument', () => {
    const msg = 'msg';
    const err = new Error(msg);
    assertThrows(() => assertNotError(err), (e: Error) => {
      assertStrictEquals(e, err);
      assertStrictEquals(e.message, msg);
    });

    const detail = {msg};
    const detailed = new ErrorWithDetail(detail, msg, {cause: err});
    assertThrows(() => assertNotError(detailed), (e: Error) => {
      assertStrictEquals(e, detailed);
      assert(e instanceof ErrorWithDetail);
      assertStrictEquals(e.message, msg);
      assertStrictEquals(e.detail, detail);
      assertStrictEquals(e.cause, err);
    });
  });

  await ctx.step(
    `doesn't throw a non-Error argument`,
    () => assertNotError(undefined),
  );
});

Deno.test('getError', async (ctx) => {
  await ctx.step('returns Error arguments directly', () => {
    const err = new Error();
    assertStrictEquals(getError(err), err);
  });

  await ctx.step('creates Error from non-Error argument', () => {
    assert(getError(undefined) instanceof Error);
  });

  await ctx.step(
    'sets non-Error argument to the "cause" property of the crated Error',
    () => {
      const msg = 'msg';
      const value = {msg};
      assertStrictEquals(getError(value).cause, value);
    },
  );
});

Deno.test('isError', async (ctx) => {
  await ctx.step('discriminates correctly', () => {
    assert(!isError(undefined));
    assert(isError(new Error()));
  });
});
