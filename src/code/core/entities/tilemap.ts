import { Vec2 } from 'src/code/misc/vec2';
import { Ref, ShallowRef } from 'vue';

import { getVisibleWorldRect, ICamera, worldToScreen } from '../camera';
import { Grid2 } from '../grid/grid2';
import { IEntity, onRender } from './entities';

export class Tilemap<TCellData> implements IEntity {
  private _grid: ShallowRef<Grid2<TCellData>>;
  private _camera: Ref<ICamera>;
  private _cellSize: Ref<number>;

  private _onCellRender?: (input: {
    canvasCtx: CanvasRenderingContext2D;
    worldPos: Vec2;
    screenPos: Vec2;
    cellData: TCellData;
    camera: ICamera;
  }) => void;

  constructor(input: {
    grid: ShallowRef<Grid2<TCellData>>;
    camera: Ref<ICamera>;
    cellSize: Ref<number>;
    onCellRender?: (input: {
      canvasCtx: CanvasRenderingContext2D;
      worldPos: Vec2;
      screenPos: Vec2;
      cellData: TCellData;
      camera: ICamera;
    }) => void;
  }) {
    this._camera = input.camera;
    this._cellSize = input.cellSize;
    this._grid = input.grid;
    this._onCellRender = input.onCellRender;
  }

  setup(): void {
    onRender(({ canvasCtx }) => {
      const screenSize = new Vec2(
        canvasCtx.canvas.width,
        canvasCtx.canvas.height
      );

      const visibleWorldRect = getVisibleWorldRect({
        screenSize: screenSize,
        camera: this._camera.value,
        cellSize: this._cellSize.value,
      });

      const gridSlice = this._grid.value.getSlice({
        rect: visibleWorldRect.to2D(),
      });

      gridSlice.iterateCells(({ pos, cell }) => {
        const screenPos = worldToScreen({
          screenSize: screenSize,
          camera: this._camera.value,
          worldPos: pos.to3D(this._camera.value.pos.z),
          cellSize: this._cellSize.value,
        });

        this._onCellRender?.({
          canvasCtx: canvasCtx,
          worldPos: pos,
          screenPos: screenPos,
          cellData: cell,
          camera: this._camera.value,
        });
      });
    });
  }
}
