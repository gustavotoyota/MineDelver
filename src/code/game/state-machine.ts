import { Ref, watch, WatchStopHandle } from 'vue';

interface Transition<S, D> {
  condition: (input: { state: S; data: D }) => boolean;
  to: (input: { prevState: S; data: D }) => S;
}

export class StateMachine<D, S = string> {
  private _state: Ref<S>;
  private _data: Ref<D>;
  private _transitions: Transition<S, D>[];

  private _listeners: ((value: { state: S; data: D }) => void)[] = [];

  private _unwatch: WatchStopHandle;

  constructor(input: {
    initialState: Ref<S>;
    data: Ref<D>;
    transitions: Transition<S, D>[];
  }) {
    this._state = input.initialState;
    this._data = input.data;

    this._transitions = input.transitions;

    this._unwatch = watch(
      this._data,
      () => {
        for (const transition of this._transitions) {
          if (
            transition.condition({
              state: this._state.value,
              data: this._data.value,
            })
          ) {
            this._state.value = transition.to({
              prevState: this._state.value,
              data: this._data.value,
            });

            this._listeners.forEach((listener) =>
              listener({ state: this._state.value, data: this._data.value })
            );

            break;
          }
        }
      },
      { deep: true }
    );
  }

  destroy(): void {
    this._unwatch();
  }

  get state() {
    return this._state.value;
  }

  get data() {
    return this._data.value;
  }
}
