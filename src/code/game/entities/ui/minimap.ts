import { Rect3 } from 'src/code/misc/rect3';
import { IVec2 } from 'src/code/misc/vec2';
import { Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { ICamera } from '../../camera';
import { IRuntimeCellInfos } from '../../map/cells';
import { Grid } from '../../map/grid';
import { getGridSegmentFromWorldRect } from '../../map/visible-cells';
import { IEntity, onRender } from '../entities';

export class Minimap implements IEntity {
  private _grid: Grid<IRuntimeCellInfos>;
  private _pos: Ref<IVec2>;
  private _size: Ref<IVec2>;
  private _scale: Ref<number>;
  private _camera: Ref<ICamera>;

  constructor(input: {
    grid: Grid<IRuntimeCellInfos>;
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

      const gridSegment = getGridSegmentFromWorldRect({
        grid: this._grid,
        worldRect: worldRect,
      });

      const imageData = input.canvasCtx.getImageData(
        this._pos.value.x,
        this._pos.value.y,
        this._size.value.x,
        this._size.value.y
      );

      const data = new Uint32Array(imageData.data.buffer);

      for (let y = 0; y < this._size.value.y; y++) {
        const row = gridSegment.cells[0][Math.floor(y / this._scale.value)];

        for (let x = 0; x < this._size.value.x; x++) {
          const cellInfos = row[Math.floor(x / this._scale.value)];

          if (cellInfos?.revealed) {
            data[y * this._size.value.x + x] = 0xffffffff;
          }
        }
      }

      input.canvasCtx.putImageData(
        imageData,
        this._pos.value.x,
        this._pos.value.y
      );

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
