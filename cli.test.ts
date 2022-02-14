import {
  assert,
  assertEquals,
  assertThrows,
  ErrorWithDetail,
} from './test_deps.ts';

import {printAndExit} from './cli.ts';
import {type Fn} from './types.ts';

Deno.test('printAndExit', async (ctx) => {
  type MethodSubstitutions = Map<string, [original: Fn, substitute: Fn]>;
  // deno-lint-ignore no-explicit-any
  const subMap = new Map<any, MethodSubstitutions>();

  subMap.set(console, new Map([
    ['error', [
      console.error,
      (..._: Parameters<typeof console['error']>): void => {},
    ]],
    ['log', [
      console.log,
      (..._: Parameters<typeof console['log']>): void => {},
    ]],
  ]));

  subMap.set(Deno, new Map([
    ['exit', [
      Deno.exit,
      (...[code]: Parameters<typeof Deno['exit']>): never => {
        throw new ErrorWithDetail({code});
      },
    ]],
  ]));

  for (const [o, subs] of subMap) for (const [m, [, sub]] of subs) o[m] = sub;

  await ctx.step('exits using default code', () => {
    const code = 1;
    const fn = () => printAndExit('oops');
    assertThrows(fn, <E extends Error>(e: E) => {
      assert(e instanceof ErrorWithDetail);
      assertEquals(e.detail.code, code);
    });
  });

  await ctx.step('exits using specified code', () => {
    let code = 1;
    let fn = () => printAndExit('oops', code);
    assertThrows(fn, <E extends Error>(e: E) => {
      assert(e instanceof ErrorWithDetail);
      assertEquals(e.detail.code, code);
    });

    code = 0
    fn = () => printAndExit('ok', code);
    assertThrows(fn, <E extends Error>(e: E) => {
      assert(e instanceof ErrorWithDetail);
      assertEquals(e.detail.code, code);
    });
  });

  for (const [o, subs] of subMap) for (const [m, [orig]] of subs) o[m] = orig;
});
