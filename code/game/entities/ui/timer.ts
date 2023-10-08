import { IVec2 } from "~/code/misc/vec2";
import { IEntity, onCreate, onRender } from "../entities";

export class Timer implements IEntity {
  private _currentTime: Ref<number>;
  private _startTime = 0;
  private _pos: Ref<IVec2>;

  constructor(input: { currentTime: Ref<number>; pos: Ref<IVec2> }) {
    this._currentTime = input.currentTime;
    this._pos = input.pos;
  }

  setup() {
    onCreate(() => {
      this._startTime = this._currentTime.value;
    });

    onRender((input) => {
      const timeSpent = this._currentTime.value - this._startTime;

      input.canvasCtx.fillStyle = "white";
      input.canvasCtx.textBaseline = "top";
      input.canvasCtx.font = "16px Arial";
      input.canvasCtx.fillText(
        Intl.DateTimeFormat("en-US", {
          minute: "numeric",
          second: "numeric",
        }).format(new Date(timeSpent)),
        this._pos.value.x,
        this._pos.value.y
      );
    });
  }
}
