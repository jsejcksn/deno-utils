import type {Fn} from './types.d.ts';

export type TypedCustomEvent<Type extends string, Detail = unknown> =
  CustomEvent<Detail> & {type: Type};

export function createEvent <Type extends string>(
  type: Type,
): TypedCustomEvent<Type, undefined>;
export function createEvent <Type extends string, Detail>(
  type: Type,
  detail: Detail,
  init?: Omit<CustomEventInit, 'detail'>,
): TypedCustomEvent<Type, Detail>;
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

type CustomEventDetailParameters<
  T extends Record<string, unknown>,
  K extends keyof T,
// > = ConditionallyOptionalParameter<T[K]>; // 🤔
> = (
  undefined extends T[K] ? [payload?: T[K]]
  : T[K] extends never ? []
  : [payload: T[K]]
);

export class CustomEventTarget<EventPayloadMap extends Record<string, unknown> = Record<never, never>> extends EventTarget {
  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  addEventListener <K extends keyof EventPayloadMap & string>(
    type: K,
    callback: CustomEventCallback<K, EventPayloadMap[K]>,
    options?: Parameters<EventTarget['addEventListener']>[2],
  ): void {
    return super.addEventListener(
      type,
      callback as Extract<Parameters<EventTarget['addEventListener']>[1], Fn>,
      options,
    );
  }

  dispatch <K extends keyof EventPayloadMap & string>(
    type: K,
    ...[detail]: CustomEventDetailParameters<EventPayloadMap, K>
  ): void {
    this.dispatchEvent(new CustomEvent(type, {detail}) as CustomEvent<EventPayloadMap[K]>);
  }

  dispatchEvent <K extends keyof EventPayloadMap & string>(event: TypedCustomEvent<K, EventPayloadMap[K]>): boolean {
    return super.dispatchEvent(event);
  }

  publish = this.dispatch;

  // deno-lint-ignore ban-ts-comment
  // @ts-ignore
  removeEventListener <K extends keyof EventPayloadMap & string>(
    type: K,
    callback: CustomEventCallback<K, EventPayloadMap[K]>,
    options?: Parameters<EventTarget['removeEventListener']>[2],
  ): void {
    return super.removeEventListener(
      type,
      callback as Extract<Parameters<EventTarget['removeEventListener']>[1], Fn>,
      options,
    );
  }

  subscribe <K extends keyof EventPayloadMap & string>(
    type: K,
    callback: Fn<CustomEventDetailParameters<EventPayloadMap, K>, void>,
  ): Fn<[never], void> {
    const fn: CustomEventCallback<K, EventPayloadMap[K]> = ({detail}) => (callback as Fn<[EventPayloadMap[K]], void>)(detail); // 🤔
    this.addEventListener(type, fn);
    return () => this.removeEventListener(type, fn);
  }
}
