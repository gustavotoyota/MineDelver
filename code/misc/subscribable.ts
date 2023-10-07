export interface Subscribable<T> {
  subscribe(listener: (value: T) => void): void;
  unsubscribe(listener: (value: T) => void): void;
}
