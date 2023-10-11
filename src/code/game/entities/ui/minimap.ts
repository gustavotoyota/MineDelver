import { Rect3 } from 'src/code/misc/rect3';
import { Vec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { ICamera } from '../../camera';
import { ICellData } from '../../map/cells';
import { Grid } from '../../map/grid';
import { IEntity, onRender } from '../entities';

export class Minimap implements IEntity {
  private _grid: Grid<ICellData>;
  private _pos: Ref<Vec2>;
  private _size: Ref<Vec2>;
  private _scale: Ref<number>;
  private _camera: Ref<ICamera>;

  constructor(input: {
    grid: Grid<ICellData>;
    pos: Ref<Vec2>;
    size: Ref<Vec2>;
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
      // Render cells

      input.canvasCtx.save();
      input.canvasCtx.fillStyle = 'white';

      const minimapWorldRect = new Rect3(
        new Vec3(
          Math.floor(
            this._camera.value.pos.x -
              this._size.value.x / 2 / this._scale.value
          ),
          Math.floor(
            this._camera.value.pos.y -
              this._size.value.y / 2 / this._scale.value
          ),
          Math.floor(this._camera.value.pos.z)
        ),
        new Vec3(
          Math.ceil(
            this._camera.value.pos.x +
              this._size.value.x / 2 / this._scale.value
          ),
          Math.ceil(
            this._camera.value.pos.y +
              this._size.value.y / 2 / this._scale.value
          ),
          Math.ceil(this._camera.value.pos.z)
        )
      );

      const cellScreenSize = Math.ceil(
        Math.max(
          this._size.value.x /
            (minimapWorldRect.max.x - minimapWorldRect.min.x),
          this._size.value.y / (minimapWorldRect.max.y - minimapWorldRect.min.y)
        )
      );
      const cellScreenSize2 = new Vec2(cellScreenSize, cellScreenSize);

      const halfWorldPos = new Vec2(minimapWorldRect.min).lerp(
        minimapWorldRect.max,
        0.5
      );

      const endScreenPos = this._pos.value.add(this._size.value);
      const centerScreenPos = this._pos.value.add(this._size.value.div(2));

      const gridSlice = this._grid.getSlice({ rect: minimapWorldRect });

      gridSlice.iterateCells(({ pos: cellPos, cell }) => {
        if (cell.unrevealed) {
          return;
        }

        const relativeCellPos = new Vec2(cellPos).sub(halfWorldPos);

        let cellScreenPos = centerScreenPos
          .add(relativeCellPos.sub(0.5).mul(cellScreenSize2))
          .round();

        const endCellScreenPos = cellScreenPos
          .add(cellScreenSize2)
          .min(endScreenPos);

        cellScreenPos = cellScreenPos.max(this._pos.value);

        const cellScreenSize = endCellScreenPos.sub(cellScreenPos).max(0);

        input.canvasCtx.fillRect(
          cellScreenPos.x,
          cellScreenPos.y,
          cellScreenSize.x,
          cellScreenSize.y
        );
      });

      // Render border

      input.canvasCtx.save();
      input.canvasCtx.strokeStyle = '#808080';
      input.canvasCtx.strokeRect(
        this._pos.value.x,
        this._pos.value.y,
        this._size.value.x,
        this._size.value.y
      );
      input.canvasCtx.restore();

      // Render player

      input.canvasCtx.save();
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
