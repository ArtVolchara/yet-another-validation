export type TObjectEntries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type FlattenTuple<T extends unknown[]> = T extends [any, ...infer R]
  ? [...T[0], ...FlattenTuple<R>]
  : [];

export type Flatten<T extends unknown[]> = T extends (number extends T['length'] ? [] : any[])
  ? FlattenTuple<T>
  : Array<FlatArray<T, 1>>;

type TUnionToIntersectionHelper<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;
export type TUnionToIntersection<U> = boolean extends U
  ? TUnionToIntersectionHelper<Exclude<U, boolean>> & boolean
  : TUnionToIntersectionHelper<U>;

export type IsUnion<T> = [T] extends [TUnionToIntersection<T>] ? false : true;

export type TPrependIfDefined<T extends string, S extends string> = T extends '' ? T : `${S}${T}`;

export type TConcatWithSeparator<T extends string[], Separator extends string> = T extends [
  infer F extends string,
  ...infer R extends string[],
] ? `${F}${TPrependIfDefined<TConcatWithSeparator<R, Separator>, Separator>}` : '';

export type TRemoveReadonly<T> = { -readonly [P in keyof T]: T[P] };


// Проверка, является ли тип any
export type IsAny<T> = 0 extends 1 & T ? true : false;

// Проверка, является ли тип unknown
export type IsUnknown<T> = IsAny<T> extends true
  ? false
  : unknown extends T
    ? T extends unknown
      ? true
      : false
    : false;

// Проверка, является ли тип any или unknown
export type IsAnyOrUnknown<T> = IsAny<T> extends true ? true : IsUnknown<T>;