import { WatchStopHandle } from "vue";

interface Transition<S, D extends object> {
  from: S;
  to: S;
  condition: (data: D) => boolean;
}

export class StateMachine<S, D extends object> {
  private _state: Ref<S>;
  private _data: D;
  private _transitions: Map<S, Transition<S, D>[]>;

  private _listeners: ((value: { state: S; data: D }) => void)[] = [];

  private _unwatch: WatchStopHandle;

  constructor(input: {
    initialState: Ref<S>;
    data: D;
    transitions: Transition<S, D>[];
  }) {
    this._state = input.initialState;
    this._data = input.data;

    this._transitions = new Map<S, Transition<S, D>[]>();

    input.transitions.forEach((transition) => {
      let transitions = this._transitions.get(transition.from);

      if (transitions == null) {
        transitions = [];

        this._transitions.set(transition.from, transitions);
      }

      transitions.push(transition);
    });

    this._unwatch = watch(this._data, () => {
      const transitions = this._transitions.get(this._state.value);

      for (const transition of transitions ?? []) {
        if (transition.condition(this._data)) {
          this._state.value = transition.to;

          this._listeners.forEach((listener) =>
            listener({ state: this._state.value, data: this._data })
          );
        }
      }
    });
  }

  destroy(): void {
    this._unwatch();
  }

  get state() {
    return this._state;
  }
}
