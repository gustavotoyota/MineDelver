import { IEntity, onRender } from "./entities";
import { IVec2 } from "~/code/misc/vec2";

export class HPBar implements IEntity {
  private _hp: Ref<number>;
  private _maxHP: Ref<number>;
  private _pos: Ref<IVec2>;

  constructor(input: { hp: Ref<number>; maxHP: Ref<number>; pos: Ref<IVec2> }) {
    this._hp = input.hp;
    this._maxHP = input.maxHP;
    this._pos = input.pos;
  }

  setup() {
    onRender((input) => {
      input.canvasCtx.save();

      input.canvasCtx.fillStyle = "red";
      input.canvasCtx.fillRect(
        this._pos.value.x,
        this._pos.value.y,
        (this._hp.value / this._maxHP.value) * 100,
        10
      );

      input.canvasCtx.restore();
    });
  }
}
