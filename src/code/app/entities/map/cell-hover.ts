import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { ICamera, worldToScreen } from '../../../core/camera';
import { IEntity, onRender } from '../../../core/entities/entities';
import { Grid3 } from '../../../core/grid/grid3';
import { ICellData } from '../../grid/cells';

export class CellHover implements IEntity {
  private _grid: Grid3<ICellData>;
  private _camera: Ref<ICamera>;
  private _cellSize: Ref<number>;
  private _pointerWorldPos: Ref<Vec3 | undefined>;
  private _screenSize: Ref<Vec2>;

  constructor(input: {
    grid: Grid3<ICellData>;
    camera: Ref<ICamera>;
    cellSize: Ref<number>;
    pointerWorldPos: Ref<Vec3 | undefined>;
    screenSize: Ref<Vec2>;
  }) {
    this._camera = input.camera;
    this._cellSize = input.cellSize;
    this._pointerWorldPos = input.pointerWorldPos;
    this._grid = input.grid;
    this._screenSize = input.screenSize;
  }

  setup(): void {
    onRender((input) => {
      if (this._pointerWorldPos.value === undefined) {
        return;
      }

      const pointerCell = this._grid.getCell(this._pointerWorldPos.value);

      const pointerScreenPos = worldToScreen({
        camera: this._camera.value,
        cellSize: this._cellSize.value,
        screenSize: this._screenSize.value,
        worldPos: new Vec3(this._pointerWorldPos.value),
      });

      input.canvasCtx.save();
      input.canvasCtx.strokeStyle = pointerCell?.unrevealed
        ? '#00d000'
        : '#f0f0f0';
      input.canvasCtx.lineWidth = 2;
      input.canvasCtx.strokeRect(
        pointerScreenPos.x -
          (this._cellSize.value / 2) * this._camera.value.zoom,
        pointerScreenPos.y -
          (this._cellSize.value / 2) * this._camera.value.zoom,
        this._cellSize.value * this._camera.value.zoom,
        this._cellSize.value * this._camera.value.zoom
      );
      input.canvasCtx.restore();
    });
  }
}
