export type TypedCustomEvent<Type extends string, Detail> =
  CustomEvent<Detail> & {type: Type};

export function createEvent <Type extends string, Detail>(
  type: Type,
  detail: Detail,
): TypedCustomEvent<Type, Detail> {
  return new CustomEvent(type, {detail}) as TypedCustomEvent<Type, Detail>;
}
