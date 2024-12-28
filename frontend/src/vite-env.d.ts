/// <reference types="vite/client" />

declare module "zustand" {
  interface StoreMutators<S> {
    withExactTypeCheck: S extends {
      setState: infer F extends (...a: never[]) => unknown;
    }
      ? Omit<S, "setState"> &
          (Parameters<Parameters<F>[0]>[0] extends infer T
            ? Parameters<F> extends [unknown, ...infer R]
              ? {
                  setState<A extends [Exact<A[0], T | Partial<T>>, ...R]>(
                    ...a: A
                  ): void;
                  setState<
                    A extends [
                      (state: T) => Exact<ReturnType<A[0]>, T | Partial<T>>,
                      ...R,
                    ],
                  >(
                    ...a: A
                  ): void;
                }
              : never
            : never)
      : never;
  }
}
declare type Exact<T, U> = T extends U
  ? U extends unknown
    ? T extends (...a: infer Ta) => infer Tr
      ? U extends (...a: never[]) => infer Ur
        ? (...a: Ta) => Exact<Tr, Ur>
        : never
      : T extends object
        ? {
            [K in keyof T]: K extends keyof U ? Exact<T[K], U[K]> : never;
          }
        : U
    : never
  : U;
export declare type ErrorCode = "error1" | "error2";
export {};
