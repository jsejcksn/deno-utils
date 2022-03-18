import {TextLineStream} from './deps.ts';
import {ErrorWithDetail} from './exceptions.ts';

export type ProcessErrorDetail = {
  cmd: string[],
  code: number,
  stderr?: string,
  stdout?: string,
};

export class ProcessError extends ErrorWithDetail<ProcessErrorDetail> {
  name = 'ProcessError';
}

export const LF = '\n';
export type LineCallback = (line: string) => void;

/** Read lines, invoking a callback with each line. */
export async function handleLines <T extends { readable: ReadableStream<Uint8Array> }>(
  withReadableStream: T,
  callback: LineCallback,
): Promise<void> {
  const rs = withReadableStream.readable
    .pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream());
  for await (const line of rs) callback(line);
}

export type ProcessOptions = {
  onStdErrLine?: LineCallback;
  onStdOutLine?: LineCallback;
};

export type ProcessResult = {
  status: Deno.ProcessStatus;
  stderr: string;
  stdout: string;
};

/** Requires permission `--allow-run`. */
export async function getProcessResult (
  cmd: string[],
  options?: ProcessOptions,
): Promise<ProcessResult> {
  const process = Deno.run({cmd, stderr: 'piped', stdout: 'piped'});

  let stderr = '';
  let stdout = '';

  const [status] = await Promise.all([
    process.status(),
    handleLines(process.stderr, line => {
      stderr += LF;
      stderr += line;
      options?.onStdErrLine?.(line);
    }),
    handleLines(process.stdout, line => {
      stdout += LF;
      stdout += line;
      options?.onStdOutLine?.(line);
    }),
  ]);

  process.close();

  return {
    status,
    stderr: stderr.slice(1),
    stdout: stdout.slice(1),
  };
}

function trimFinalNewlines (str: string): string {
  return str.replace(/(?:\r?\n)+$/u, '');
}

/**
 * Options to change the parsing behavior when reading the process output
 *
 * `print` — Print `stdout` and `stderr` messages to console. Default `false`
 *
 * `trim` — Trim trailing newlines. Default `true`
 */
export type OutputOptions = {
  print?: boolean;
  trim?: boolean;
};

/**
 * Spawns the process supplied in `cmd` and returns a string containing its
 * `stdout`. Requires permission `--allow-run`.
 */
export async function getProcessOutput (
  cmd: string[],
  options?: OutputOptions,
): Promise<string> {
  try {
    const opts = options?.print ? {
      onStdErrLine: console.error.bind(console),
      onStdOutLine: console.log.bind(console),
    } : undefined;

    const {status: {code, success}, stderr, stdout} =
      await getProcessResult(cmd, opts);

    if (!success) {
      throw new ProcessError(
        {cmd, code, stderr, stdout},
        stderr.trim() || `The process exited with a non-zero status code: ${code}`,
      );
    }

    return (options?.trim ?? true) ? trimFinalNewlines(stdout) : stdout;
  }
  catch (ex) {
    if (ex instanceof Deno.errors.NotFound) {
      throw new ProcessError(
        {cmd, code: NaN},
        ex.message,
        {cause: ex},
      );
    }
    throw ex;
  }
}
