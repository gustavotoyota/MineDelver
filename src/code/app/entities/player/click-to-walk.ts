import { ICellData } from 'src/code/domain/grid/cells';
import { Grid } from 'src/code/domain/grid/grid';
import { getShortestPath2D } from 'src/code/domain/grid/path-finding';
import { Input } from 'src/code/domain/input';
import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { IEntity, onInput } from '../../../domain/entities/entities';
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

    const shortestPath = getShortestPath2D({
      sourcePos: new Vec2(this._playerMovementManager.nextPlayerPos),
      targetPos: new Vec2(this._pointerWorldPos.value),
      getCellData: ({ cellPos }) =>
        this._grid.getCell(
          cellPos.to3D(this._playerMovementManager.nextPlayerPos.z)
        ),
      isCellObstacle: ({ cellData }) =>
        cellData?.unrevealed || !!cellData?.hasBomb,
      acceptNearTarget: true,
      canGoOverTarget: ({ targetCellData }) => !targetCellData?.flag,
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
