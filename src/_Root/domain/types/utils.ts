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

type UnionToOvlds<U> = TUnionToIntersection<U extends any ? (f: U) => void : never>;

type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;

export type TRemoveReadonly<T> = { -readonly [P in keyof T]: T[P] };
type IfEquals<X, Y, A=X, B=never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];