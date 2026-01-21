type BuildPowersOf2LengthArrays<N extends number, R extends never[][]> =
  R[0][N] extends never ? R : BuildPowersOf2LengthArrays<N, [[...R[0], ...R[0]], ...R]>;

type ConcatLargestUntilDone<N extends number, R extends never[][], B extends never[]> =
  B['length'] extends N ? B : [...R[0], ...B][N] extends never
    ? ConcatLargestUntilDone<
    N, R extends [R[0], ...infer U]
      ? U extends never[][]
        ? U : never
      : never, B
    >
    : ConcatLargestUntilDone<
    N, R extends [R[0], ...infer U]
      ? U extends never[][]
        ? U
        : never
      : never,
    [...R[0], ...B]
    >;

type Replace<R extends any[], T> = { [K in keyof R]: T };

export type TupleOf<T, N extends number> = number extends N
  ? T[]
  : {
    [K in N]: BuildPowersOf2LengthArrays<K, [[never]]> extends infer U
      ? U extends never[][]
        ? Replace<ConcatLargestUntilDone<K, U, []>, T>
        : never
      : never;
  }[N];

type Shift<A extends Array<any>> = ((...args: A) => void) extends ((...args: [A[0], ...infer R]) => void) ? R : never;

type GrowExpRev<A extends any[], N extends number, P extends any[][]> = A['length'] extends N
  ? A
  : [...A, ...P[0]][N] extends undefined
    ? GrowExpRev<[...A, ...P[0]], N, P>
    : GrowExpRev<A, N, Shift<P>>;

type GrowExp<A extends any[], N extends number, P extends any[][], L extends number = A['length']> =
  L extends N ? A : L extends 8192
    ? any[]
    : [...A, ...A][N] extends undefined
      ? GrowExp<[...A, ...A], N, [A, ...P]>
      : GrowExpRev<A, N, P>;

type MapItemType<T, I> = { [K in keyof T]: I };

// type which return array type when number is more than  8192, if less - return tuple type
export type FixedSizeArray<T, N extends number> = N extends 0
  ? []
  : MapItemType<GrowExp<[0], N, []>, T>;
