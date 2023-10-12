import { Vec2 } from 'src/code/misc/vec2';
import { Ref } from 'vue';

import { IEntity, onRender } from '../../../domain/entities/entities';
import { Images } from '../../../domain/images';

export class HPBar implements IEntity {
  private _hp: Ref<number>;
  private _pos: Ref<Vec2>;
  private _images: Images;

  constructor(input: { hp: Ref<number>; pos: Ref<Vec2>; images: Images }) {
    this._hp = input.hp;
    this._pos = input.pos;
    this._images = input.images;
  }

  setup() {
    onRender((input) => {
      if (!isFinite(this._hp.value)) {
        return;
      }

      for (let i = 0; i < this._hp.value; i++) {
        input.canvasCtx.drawImage(
          this._images.getImage('heart')!,
          this._pos.value.x + i * 20,
          this._pos.value.y,
          18,
          18
        );
      }
    });
  }
}
