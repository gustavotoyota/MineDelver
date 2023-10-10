import { Vec2 } from 'src/code/misc/vec2';
import { Ref } from 'vue';

import { IEntity, onRender } from '../entities';

export class Text implements IEntity {
  private _pos: Ref<Vec2>;
  private _text: Ref<string>;

  constructor(input: { pos: Ref<Vec2>; text: Ref<string> }) {
    this._pos = input.pos;
    this._text = input.text;
  }

  setup() {
    onRender((input) => {
      input.canvasCtx.fillStyle = '#e0e0e0';
      input.canvasCtx.textBaseline = 'top';
      input.canvasCtx.font = '14px Arial';
      input.canvasCtx.fillText(
        this._text.value,
        this._pos.value.x,
        this._pos.value.y
      );
    });
  }
}
