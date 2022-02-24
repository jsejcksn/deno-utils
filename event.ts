import type {Fn, Values} from './types.d.ts';

export type TypedCustomEvent<Type extends string, Detail = unknown> =
  CustomEvent<Detail> & {type: Type};

export function createEvent <Type extends string, Detail>(
  type: Type,
  detail?: Detail,
  init?: Omit<CustomEventInit, 'detail'>,
): TypedCustomEvent<Type, Detail> {
  const evInit = {...init, detail};
  return new CustomEvent(type, evInit) as TypedCustomEvent<Type, Detail>;
}

export type CustomEventCallback<Type extends string = string, Detail = unknown> =
  Fn<[event: TypedCustomEvent<Type, Detail>], void>;

// deno-lint-ignore no-explicit-any
export type EventCallbackFromCustomEvent<T extends TypedCustomEvent<string, any>> =
  Fn<[event: T], void>;

export type CustomEventMap = Record<string, CustomEvent>;

export class CustomEventTarget<T extends CustomEventMap = Record<never, never>> extends EventTarget {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  addEventListener <K extends keyof T & string>(
    type: K,
    callback: EventCallbackFromCustomEvent<T[K]>,
    options?: Parameters<EventTarget['addEventListener']>[2],
  ): void {
    return super.addEventListener(
      type,
      callback as Extract<Parameters<EventTarget['addEventListener']>[1], Fn>,
      options,
    );
  }

  dispatch <K extends keyof T & string>(
    type: K,
    ...[detail]: (
      unknown extends T[K]['detail'] ? [detail?: unknown]
      : T[K]['detail'] extends undefined ? [detail?: undefined]
      : T[K]['detail'] extends never ? []
      : [detail: T[K]['detail']]
    )
  ): void {
    const event = createEvent(type, detail) as unknown as Values<T>;
    this.dispatchEvent(event);
  }

  dispatchEvent <E extends Values<T>>(event: E): boolean {
    return super.dispatchEvent(event);
  }

  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  removeEventListener <K extends keyof T & string>(
    type: K,
    callback: EventCallbackFromCustomEvent<T[K]>,
    options?: Parameters<EventTarget['removeEventListener']>[2],
  ): void {
    return super.removeEventListener(
      type,
      callback as Extract<Parameters<EventTarget['removeEventListener']>[1], Fn>,
      options,
    );
  }
}
