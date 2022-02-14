// deno-lint-ignore no-explicit-any
type IsArrayGeneric = <T>(_: T) => _ is Extract<T, readonly any[]>;
const isArray = Array.isArray.bind(Array) as IsArrayGeneric;

/** Logs message to stderr/stdout and terminates the program */
export function printAndExit (message: string, code?: number): never;
/** Logs messages to stderr/stdout and terminates the program */
export function printAndExit (messages: readonly string[], code?: number): never;
export function printAndExit (
  messages: string | readonly string[],
  code = 1,
): never {
  const fn = console[code === 0 ? 'log' : 'error'].bind(console);
  for (const msg of isArray(messages) ? messages : [messages]) fn(msg);
  Deno.exit(code);
}
