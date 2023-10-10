import { Rect3 } from 'src/code/misc/rect3';
import {
  add2,
  div2Scalar,
  IVec2,
  lerp2,
  max2,
  min2,
  mul2,
  round2,
  sub2,
  sub2Scalar,
  Vec2,
} from 'src/code/misc/vec2';
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

      const halfWorldPos = lerp2(
        minimapWorldRect.min,
        minimapWorldRect.max,
        0.5
      );

      const endScreenPos = add2(this._pos.value, this._size.value);
      const centerScreenPos = add2(
        this._pos.value,
        div2Scalar(this._size.value, 2)
      );

      const gridSlice = this._grid.getSlice({ rect: minimapWorldRect });

      gridSlice.iterateCells(({ pos: cellPos, cell }) => {
        if (cell.revealed) {
          const relativeCellPos = sub2(cellPos, halfWorldPos);

          let cellScreenPos = round2(
            add2(
              centerScreenPos,
              mul2(sub2Scalar(relativeCellPos, 0.5), cellScreenSize2)
            )
          );

          const endCellScreenPos = min2(
            add2(cellScreenPos, cellScreenSize2),
            endScreenPos
          );

          cellScreenPos = max2(cellScreenPos, this._pos.value);

          const cellScreenSize = max2(
            sub2(endCellScreenPos, cellScreenPos),
            new Vec2()
          );

          input.canvasCtx.fillRect(
            cellScreenPos.x,
            cellScreenPos.y,
            cellScreenSize.x,
            cellScreenSize.y
          );
        }
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
