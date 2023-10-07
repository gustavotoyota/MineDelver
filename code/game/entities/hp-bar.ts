import { IRef } from "~/code/misc/ref";
import { IEntity, onRender } from "../entities";
import { IVec2 } from "~/code/misc/vec2";

export class HPBar implements IEntity {
  private _hp: IRef<number>;
  private _pos: IRef<IVec2>;

  constructor(input: { hp: IRef<number>; pos: IRef<IVec2> }) {
    this._hp = input.hp;
    this._pos = input.pos;
  }

  setup() {
    onRender((input) => {
      input.canvasCtx.save();

      input.canvasCtx.fillStyle = "red";
      input.canvasCtx.fillRect(
        this._pos.value.x,
        this._pos.value.y,
        this._hp.value,
        10
      );

      input.canvasCtx.restore();
    });
  }
}
