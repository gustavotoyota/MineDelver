import { Input } from 'src/code/game/input';
import { ICellData } from 'src/code/game/map/cells';
import { Grid } from 'src/code/game/map/grid';
import { getShortestPath } from 'src/code/game/map/path-finding';
import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { IEntity, onInput } from '../../entities';
import { PlayerMovementManager } from './movement-manager';

export class ClickToWalk implements IEntity {
  private _grid: Grid<ICellData>;
  private _playerMovementManager: PlayerMovementManager;
  private _pointerWorldPos: Ref<Vec3 | undefined>;

  constructor(input: {
    grid: Grid<ICellData>;
    playerMovementManager: PlayerMovementManager;
    pointerWorldPos: Ref<Vec3 | undefined>;
  }) {
    this._grid = input.grid;
    this._playerMovementManager = input.playerMovementManager;
    this._pointerWorldPos = input.pointerWorldPos;
  }

  private _clickToWalk(): void {
    if (!Input.pointerDown[0] || this._pointerWorldPos.value === undefined) {
      return;
    }

    if (
      new Vec2(this._pointerWorldPos.value).equals(
        this._playerMovementManager.finalTargetPos
      )
    ) {
      return;
    }

    const shortestPath = getShortestPath({
      grid: this._grid,
      sourcePos: this._playerMovementManager.nextPlayerPos,
      targetPos: new Vec2(this._pointerWorldPos.value),
    });

    if (shortestPath === undefined) {
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
