import {
  assertEquals,
  assertStrictEquals,
} from './test_deps.ts';
import {pick} from './transform.ts';

Deno.test('pick', async (ctx) => {
  await ctx.step('picks properties', () => {
    const obj = {a: 'a', b: 'b', c: 'c'};
    const actual = pick(obj, ['b', 'a']);
    const expected = {a: 'a', b: 'b'};
    assertEquals(actual, expected);
    assertStrictEquals(JSON.stringify(actual), `{"b":"b","a":"a"}`);
  });
});
