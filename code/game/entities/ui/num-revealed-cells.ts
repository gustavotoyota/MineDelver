import { IVec2 } from "~/code/misc/vec2";
import { IEntity, onCreate, onRender } from "../entities";

export class NumRevealedCells implements IEntity {
  private _numRevealedCells: Ref<number>;
  private _pos: Ref<IVec2>;

  constructor(input: { numRevealedCells: Ref<number>; pos: Ref<IVec2> }) {
    this._numRevealedCells = input.numRevealedCells;
    this._pos = input.pos;
  }

  setup() {
    onRender((input) => {
      input.canvasCtx.fillStyle = "#e0e0e0";
      input.canvasCtx.textBaseline = "top";
      input.canvasCtx.font = "14px Arial";
      input.canvasCtx.fillText(
        `Revealed: ${this._numRevealedCells.value}`,
        this._pos.value.x,
        this._pos.value.y
      );
    });
  }
}
