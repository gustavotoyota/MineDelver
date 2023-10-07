import { IVec2, Vec2 } from "~/code/misc/vec2";
import { IEntity, onRender } from "../entities";
import {
  getGridSegmentFromWorldRect,
  getVisibleWorldRect,
} from "../map/visible-cells";
import { ICamera, screenToWorld, worldToScreen } from "../camera";
import { IRef } from "~/code/misc/ref";
import { Images } from "../images";
import { Grid } from "../map/grid";
import { IRuntimeCellInfos } from "../map/cells";
import { WorldPos } from "../map/position";
import { Vec3 } from "~/code/misc/vec3";

export interface IDrawCell {
  (input: {
    canvasCtx: CanvasRenderingContext2D;
    worldPos: WorldPos;
    screenPos: IVec2;
    cellInfos: IRuntimeCellInfos | undefined; // Here for optimization
    camera: ICamera;
  }): void;
}

export class GameMap implements IEntity {
  private _images: Images;
  private _grid: Grid<IRuntimeCellInfos>;
  private _camera: IRef<ICamera>;
  private _cellSize: IRef<number>;
  private _mouseScreenPos: IRef<Vec2 | undefined>;
  private _drawLayerCell: IDrawCell[];
  private _bgColor: IRef<string>;

  constructor(input: {
    images: Images;
    grid: Grid<IRuntimeCellInfos>;
    camera: IRef<ICamera>;
    cellSize: IRef<number>;
    mouseScreenPos: IRef<Vec2 | undefined>;
    drawLayerCell: IDrawCell[];
    bgColor: IRef<string>;
  }) {
    this._images = input.images;
    this._camera = input.camera;
    this._cellSize = input.cellSize;
    this._mouseScreenPos = input.mouseScreenPos;
    this._grid = input.grid;
    this._drawLayerCell = input.drawLayerCell;
    this._bgColor = input.bgColor;
  }

  setup(): void {
    onRender((input) => {
      const visibleWorldRect = getVisibleWorldRect({
        screenSize: new Vec2(
          input.canvasCtx.canvas.width,
          input.canvasCtx.canvas.height
        ),
        camera: this._camera.value,
        cellSize: this._cellSize.value,
      });

      const gridSegment = getGridSegmentFromWorldRect({
        grid: this._grid,
        worldRect: visibleWorldRect,
      });

      const screenSize = new Vec2(
        input.canvasCtx.canvas.width,
        input.canvasCtx.canvas.height
      );

      // Clear the canvas

      input.canvasCtx.save();
      input.canvasCtx.fillStyle = this._bgColor.value;
      input.canvasCtx.fillRect(0, 0, screenSize.x, screenSize.y);
      input.canvasCtx.restore();

      // Draw the map

      for (let layer = 0; layer < this._drawLayerCell.length; layer++) {
        for (let y = 0; y < gridSegment.cells[0].length; y++) {
          const row = gridSegment.cells[0][y];

          for (let x = 0; x < row.length; x++) {
            const cellInfos = row[x];

            const worldPos = new WorldPos(
              gridSegment.from.x + x,
              gridSegment.from.y + y,
              gridSegment.from.z
            );

            const screenPos = worldToScreen({
              screenSize: screenSize,
              camera: this._camera.value,
              worldPos: worldPos,
              cellSize: this._cellSize.value,
            });

            this._drawLayerCell[layer]({
              canvasCtx: input.canvasCtx,
              worldPos: worldPos,
              screenPos: screenPos,
              cellInfos: cellInfos,
              camera: this._camera.value,
            });
          }
        }
      }

      // Draw the hovered cell

      if (this._mouseScreenPos.value !== undefined) {
        const mouseWorldPos = screenToWorld({
          camera: this._camera.value,
          cellSize: this._cellSize.value,
          screenSize: screenSize,
          screenPos: this._mouseScreenPos.value,
        });

        mouseWorldPos.x = Math.round(mouseWorldPos.x);
        mouseWorldPos.y = Math.round(mouseWorldPos.y);

        const mouseCell =
          gridSegment.cells[0][mouseWorldPos.y - gridSegment.from.y][
            mouseWorldPos.x - gridSegment.from.x
          ];

        const mouseScreenPos = worldToScreen({
          camera: this._camera.value,
          cellSize: this._cellSize.value,
          screenSize: screenSize,
          worldPos: new Vec3(
            Math.round(mouseWorldPos.x),
            Math.round(mouseWorldPos.y),
            Math.round(mouseWorldPos.z)
          ),
        });

        input.canvasCtx.save();
        input.canvasCtx.strokeStyle = mouseCell?.revealed ? "white" : "green";
        input.canvasCtx.lineWidth = 2;
        input.canvasCtx.strokeRect(
          mouseScreenPos.x - this._cellSize.value / 2,
          mouseScreenPos.y - this._cellSize.value / 2,
          this._cellSize.value,
          this._cellSize.value
        );
        input.canvasCtx.restore();
      }
    });
  }
}
