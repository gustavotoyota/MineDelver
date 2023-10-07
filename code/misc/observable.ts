import { IRef, Ref } from "./ref";

export interface Observable<T> {
  value: T;

  subscribe(listener: (value: T) => void): void;
  unsubscribe(listener: (value: T) => void): void;
}

export function useObservables<T, R>(
  observables: Observable<T>[],
  func: () => R
): IRef<R> {
  observables.forEach((observable) => observable.subscribe(updateRef));

  const ref = new Ref(func());

  function updateRef() {
    ref.value = func();
  }

  onUnmounted(() => {
    observables.forEach((observable) => observable.unsubscribe(updateRef));
  });

  return ref;
}

export function useObservable<T, R>(
  observable: Observable<T>,
  func: (value: T) => R
): IRef<R> {
  return useObservables([observable], () => func(observable.value));
}
