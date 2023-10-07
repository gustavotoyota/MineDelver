import { pull } from "lodash";
import { Observable } from "./observable";

export interface IRef<T> extends Observable<T> {}

export class Ref<T = undefined> implements IRef<T> {
  private _value: T;

  private _listeners: ((value: T) => void)[] = [];

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  set value(value: T) {
    if (value === this._value) {
      return;
    }

    this._value = value;

    this._listeners.forEach((listener) => listener(value));
  }

  subscribe(listener: (value: T) => void): void {
    this._listeners.push(listener);
  }
  unsubscribe(listener: (value: T) => void): void {
    pull(this._listeners, listener);
  }
}
export function useRef<T>(value: T): IRef<T>;
export function useRef<T>(value?: T): IRef<T | undefined>;
export function useRef<T>(value: T): IRef<T> {
  return new Ref(value);
}
