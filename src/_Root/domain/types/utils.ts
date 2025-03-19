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

// Concat with separator
export type TConcatWithoutSeparator<T extends string[]> = T extends [
  infer F extends string,
  ...infer R extends string[],
] ? `${F}${TConcatWithoutSeparator<R>}` : '';

export type TPrependIfDefined<T extends string, S extends string> = T extends '' ? T : `${S}${T}`;

export type TConcatWithSeparator<T extends string[], Separator extends string> = T extends [
  infer F extends string,
  ...infer R extends string[],
] ? `${F}${TPrependIfDefined<TConcatWithSeparator<R, Separator>, Separator>}` : '';

type UnionToOvlds<U> = TUnionToIntersection<U extends any ? (f: U) => void : never>;

type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;

export type TStringUnionCombosConcat<U extends string, Sep extends string> = PopUnion<U> extends infer SELF
  ? SELF extends string
    ? Exclude<U, SELF> extends never
      ? SELF
      :
      | `${TStringUnionCombosConcat<Exclude<U, SELF>, Sep>}${Sep}${SELF}`
      | TStringUnionCombosConcat<Exclude<U, SELF>, Sep>
      | SELF
    : never
  : never;

// Не знаю как выдать тип с правильным порядком. Вообще компилятором это не гарантируется в любом случае, поэтому об этом можно не думать
export type TUnionCombosTuples<U> = PopUnion<U> extends infer SELF
  ? Exclude<U, SELF> extends never
    ? [SELF]
    : [...TUnionCombosTuples<Exclude<U, SELF>>, SELF] | TUnionCombosTuples<Exclude<U, SELF>> | [SELF]
  : never;
