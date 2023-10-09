import { Input } from 'src/code/game/input';
import { IRuntimeCellInfos } from 'src/code/game/map/cells';
import { Grid } from 'src/code/game/map/grid';
import { getShortestPath } from 'src/code/game/map/path-finding';
import { equal2D } from 'src/code/misc/vec2';
import { IVec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { IEntity, onInput } from '../../entities';
import { PlayerMovementManager } from './movement-manager';

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
      sourcePos: this._playerMovementManager.nextPlayerPos,
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
  }
}
