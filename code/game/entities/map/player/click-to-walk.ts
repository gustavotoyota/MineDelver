import { Input } from "~/code/game/input";
import { IEntity, onInput, onUpdate } from "../../entities";
import { getShortestPath } from "~/code/game/map/path-finding";
import { Grid } from "~/code/game/map/grid";
import { IRuntimeCellInfos } from "~/code/game/map/cells";
import { PlayerMovementManager } from "./movement-manager";
import { IVec3 } from "~/code/misc/vec3";
import { equal2D } from "~/code/misc/vec2";

export class ClickToWalk implements IEntity {
  private _grid: Grid<IRuntimeCellInfos>;
  private _playerMovementManager: PlayerMovementManager;
  private _pointerWorldPos: Ref<IVec3 | undefined>;

  constructor(input: {
    grid: Grid<IRuntimeCellInfos>;
    playerMovementManager: PlayerMovementManager;
    pointerWorldPos: Ref<IVec3 | undefined>;
  }) {
    this._grid = input.grid;
    this._playerMovementManager = input.playerMovementManager;
    this._pointerWorldPos = input.pointerWorldPos;
  }

  private _clickToWalk(): void {
    if (!Input.pointerDown[0] || this._pointerWorldPos.value == null) {
      return;
    }

    if (
      equal2D(
        this._pointerWorldPos.value,
        this._playerMovementManager.finalTargetPos
      )
    ) {
      return;
    }

    const shortestPath = getShortestPath({
      grid: this._grid,
      sourcePos: this._playerMovementManager.targetPlayerPos,
      targetPos: this._pointerWorldPos.value,
    });

    if (shortestPath == null) {
      return;
    }

    this._playerMovementManager.setNextMovements(shortestPath);
  }

  setup(): void {
    onInput(() => {
      this._clickToWalk();
    });

    onUpdate(() => {
      this._clickToWalk();
    });
  }
}
