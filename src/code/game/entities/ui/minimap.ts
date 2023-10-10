import { Rect3 } from 'src/code/misc/rect3';
import { IVec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { ICamera } from '../../camera';
import { ICellData } from '../../map/cells';
import { Grid } from '../../map/grid';
import { IEntity, onRender } from '../entities';

export class Minimap implements IEntity {
  private _grid: Grid<ICellData>;
  private _pos: Ref<IVec2>;
  private _size: Ref<IVec2>;
  private _scale: Ref<number>;
  private _camera: Ref<ICamera>;

  constructor(input: {
    grid: Grid<ICellData>;
    pos: Ref<IVec2>;
    size: Ref<IVec2>;
    scale: Ref<number>;
    camera: Ref<ICamera>;
  }) {
    this._grid = input.grid;
    this._pos = input.pos;
    this._size = input.size;
    this._scale = input.scale;
    this._camera = input.camera;
  }

  setup() {
    onRender((input) => {
      // Render border

      input.canvasCtx.save();
      input.canvasCtx.strokeStyle = 'rgba(255,255,255, 0.5)';
      input.canvasCtx.lineWidth = 1;
      input.canvasCtx.strokeRect(
        this._pos.value.x,
        this._pos.value.y,
        this._size.value.x,
        this._size.value.y
      );
      input.canvasCtx.restore();

      // Render cells

      input.canvasCtx.save();
      input.canvasCtx.fillStyle = 'white';

      const worldRect = new Rect3(
        new Vec3(
          Math.round(
            this._camera.value.pos.x -
              this._size.value.x / 2 / this._scale.value
          ),
          Math.round(
            this._camera.value.pos.y -
              this._size.value.y / 2 / this._scale.value
          ),
          Math.round(this._camera.value.pos.z)
        ),
        new Vec3(
          Math.round(
            this._camera.value.pos.x +
              this._size.value.x / 2 / this._scale.value
          ),
          Math.round(
            this._camera.value.pos.y +
              this._size.value.y / 2 / this._scale.value
          ),
          Math.round(this._camera.value.pos.z)
        )
      );

      const gridSlice = this._grid.getSlice({ rect: worldRect });

      gridSlice.iterateCells(({ pos, cell }) => {
        if (cell.revealed) {
          input.canvasCtx.fillRect(
            Math.round(
              this._pos.value.x + (pos.x - worldRect.min.x) * this._scale.value
            ),
            Math.round(
              this._pos.value.y + (pos.y - worldRect.min.y) * this._scale.value
            ),
            Math.ceil(this._scale.value),
            Math.ceil(this._scale.value)
          );
        }
      });

      // Render player

      input.canvasCtx.fillStyle = 'red';
      input.canvasCtx.fillRect(
        Math.round(
          this._pos.value.x + this._size.value.x / 2 - this._scale.value / 2
        ),
        Math.round(
          this._pos.value.y + this._size.value.y / 2 - this._scale.value / 2
        ),
        Math.floor(this._scale.value * 1.5),
        Math.floor(this._scale.value * 1.5)
      );
      input.canvasCtx.restore();
    });
  }
}
