import { Vec2 } from 'src/code/misc/vec2';
import { Ref } from 'vue';

import { IEntity, onCreate, onRender } from '../../../core/entities/entities';

export class Timer implements IEntity {
  private _currentTime: Ref<number>;
  private _startTime = 0;
  private _pos: Ref<Vec2>;

  constructor(input: { currentTime: Ref<number>; pos: Ref<Vec2> }) {
    this._currentTime = input.currentTime;
    this._pos = input.pos;
  }

  setup() {
    onCreate(() => {
      this._startTime = this._currentTime.value;
    });

    onRender((input) => {
      const timeSpent = this._currentTime.value - this._startTime;

      input.canvasCtx.fillStyle = '#e0e0e0';
      input.canvasCtx.textBaseline = 'top';
      input.canvasCtx.font = '14.5px Play';
      input.canvasCtx.fillText(
        `Time: ${Intl.DateTimeFormat('en-US', {
          minute: 'numeric',
          second: 'numeric',
        }).format(new Date(timeSpent))}`,
        this._pos.value.x,
        this._pos.value.y
      );
    });
  }
}
