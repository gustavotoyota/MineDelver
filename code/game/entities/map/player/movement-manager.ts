import { IRuntimeCellInfos } from "~/code/game/map/cells";
import { Grid } from "~/code/game/map/grid";
import { IVec2, equal2D } from "~/code/misc/vec2";
import { vec2To3 } from "~/code/misc/vec3";
import { PlayerEntity } from "./player";

export class PlayerMovementManager {
  private _playerEntity: PlayerEntity;
  private _movements: IVec2[] = [];

  constructor(input: { playerEntity: PlayerEntity }) {
    this._playerEntity = input.playerEntity;
  }

  cancelMovements() {
    this._movements = [];
  }

  private _executeNextMovement(input: { sourcePos: IVec2 }): IVec2 | undefined {
    if (this._movements.length === 0) {
      return;
    }

    if (!equal2D(this._playerEntity.worldPos.value, input.sourcePos)) {
      return;
    }

    const newPlayerPos = vec2To3(
      this._movements.pop()!,
      this._playerEntity.worldPos.value.z
    );

    const result = this._playerEntity.walk({ targetPos: newPlayerPos });

    if (result == null) {
      this.cancelMovements();
      return;
    }

    result.then(() => {
      if (equal2D(newPlayerPos, this._playerEntity.worldPos.value)) {
        this._executeNextMovement({ sourcePos: newPlayerPos });
      } else {
        this.cancelMovements();
      }
    });
  }

  enqueueMovements(movements: IVec2[]) {
    this.cancelMovements();

    this._movements = movements.toReversed();

    this._executeNextMovement({ sourcePos: this._playerEntity.worldPos.value });
  }
}
