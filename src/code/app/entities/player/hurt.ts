import { Ref, watch, WatchStopHandle } from 'vue';

import { onDestroy } from '../../../core/entities/entities';

export class PlayerHurt {
  private _hp: Ref<number>;

  private _currentTime: Ref<number>;

  private _unwatchHP?: WatchStopHandle;
  private _hurtEndTime = 0;

  constructor(input: { hp: Ref<number>; currentTime: Ref<number> }) {
    this._hp = input.hp;

    this._currentTime = input.currentTime;
  }

  setup() {
    this._unwatchHP = watch(this._hp, () => {
      this._hurtEndTime = this._currentTime.value + 750;
    });

    onDestroy(() => {
      this._unwatchHP?.();
    });
  }

  isHurt(): boolean {
    return this._currentTime.value < this._hurtEndTime;
  }

  isBlinking(): boolean {
    return (
      this.isHurt() && (this._hurtEndTime - this._currentTime.value) % 150 > 75
    );
  }
}
