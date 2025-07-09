export type TRemoveReadonly<T> = { -readonly [P in keyof T]: T[P] };
type IfEquals<X, Y, A=X, B=never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];

type TDeepRemoveReadonlyPrimitive = undefined | null | boolean | string | number | Function;
export type TDeepRemoveReadonly<T> =
    T extends TDeepRemoveReadonlyPrimitive ? T :
    T extends Array<infer U> ? TDeepRemoveReadonlyArray<U> :
    T extends Map<infer K, infer V> ? TDeepRemoveReadonlyMap<K, V> :
    T extends Set<infer T> ? DeepWriableSet<T> : TDeepRemoveReadonlyObject<T>;

type TDeepRemoveReadonlyArray<T> = Array<TDeepRemoveReadonly<T>>;
type TDeepRemoveReadonlyMap<K, V> = Map<K, TDeepRemoveReadonly<V>>;
type DeepWriableSet<T> = Set<TDeepRemoveReadonly<T>>;

type TDeepRemoveReadonlyObject<T> = {
    [K in WritableKeys<T>]: TDeepRemoveReadonly<T[K]>
};

