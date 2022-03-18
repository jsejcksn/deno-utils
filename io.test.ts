import {
  assert,
  assertEquals,
  assertStrictEquals,
  unimplemented,
} from './test_deps.ts';
import {
  getProcessOutput,
  getProcessResult,
  handleLines,
  LF,
} from './io.ts';

Deno.test('handleLines', async (ctx) => {
  await ctx.step('invokes callback for each line read', async () => {
    const expected = ['a', 'b', 'c'];
    const actual: string[] = [];
    const stream = new TextEncoderStream();

    const writeAll = async <T>(writableStream: WritableStream<T>, chunk: T) => {
      const writer = writableStream.getWriter();
      await writer.ready.then(() => writer.write(chunk));
      await writer.ready.then(writer.close.bind(writer));
    };

    const text = expected.map(str =>`${str}${LF}`).join('');

    await Promise.all([
      handleLines(stream, actual.push.bind(actual)),
      writeAll(stream.writable, text),
    ]);

    // Remove last element from array (empty string from final empty line)
    actual.pop();
    assertEquals(actual, expected);
  });
});

Deno.test('getProcessOutput', async (ctx) => {
  await ctx.step('returns "hello world" using echo', async () => {
    const expected = 'hello world';

    const cmd = Deno.build.os === 'windows' ?
      ['cmd', '/c', 'echo hello world']
      : ['echo', 'hello world'];

    const actual = await getProcessOutput(cmd);
    assertStrictEquals(actual, expected);
  });

  await ctx.step('correctly implements "trim" option', async () => {
    const cmd = Deno.build.os === 'windows' ?
      ['cmd', '/c', 'echo hello world']
      : ['echo', 'hello world'];

    let actual = await getProcessOutput(cmd);
    assertStrictEquals(actual, 'hello world');

    actual = await getProcessOutput(cmd, {trim: true});
    assertStrictEquals(actual, 'hello world');

    actual = await getProcessOutput(cmd, {trim: false});
    assert((/^hello world(?:\r?\n){1}$/).test(actual));
  });

  await ctx.step({
    name: 'correctly implements "print" option',
    ignore: true,
    fn: () => {/* 🤔 */},
  });
});

Deno.test('getProcessResult', async (ctx) => {
  await ctx.step('test coverage is adequate', () => {
    unimplemented();
  });
});
