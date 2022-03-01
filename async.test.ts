import {delay} from './async.ts';
import {assert, assertStrictEquals} from './test_deps.ts';

Deno.test('delay', async (ctx) => {
  await ctx.step('does not resolve prematurely', async () => {
    const mark = performance.now();
    const expected = 100;
    const result = await delay(expected);
    const actual = performance.now() - mark;
    assertStrictEquals(result, undefined);
    assert(actual >= expected);
  });
});
