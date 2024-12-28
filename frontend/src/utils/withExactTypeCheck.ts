/* eslint-disable @typescript-eslint/no-unused-vars */
import { StateCreator, StoreMutatorIdentifier } from "zustand";

/* 
  This file describes function "withExactTypeCheck" 
  that allows zustand global state manager to check 
  exact type when using its "set" function.
*/

type WithExactTypeCheck = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
>(
  f: StateCreator<T, [...Mps, ["withExactTypeCheck", never]], Mcs>
) => StateCreator<T, Mps, [["withExactTypeCheck", never], ...Mcs]>;

declare module "zustand" {
  // @ts-ignore
  interface StoreMutators<S, A> {
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

type Exact<T, U> = T extends U
  ? U extends unknown
    ? T extends (...a: infer Ta) => infer Tr
      ? U extends (...a: never[]) => infer Ur
        ? (...a: Ta) => Exact<Tr, Ur>
        : never
      : T extends object
        ? { [K in keyof T]: K extends keyof U ? Exact<T[K], U[K]> : never }
        : U
    : never
  : U;

export const withExactTypeCheck = ((f) => f) as WithExactTypeCheck;
