import { IVec2, Vec2 } from "~/code/misc/vec2";
import { Vec3 } from "~/code/misc/vec3";
import { ICamera, screenToWorld, worldToScreen } from "../camera";
import { Images } from "../images";
import { IRuntimeCellInfos } from "../map/cells";
import { Grid } from "../map/grid";
import { WorldPos } from "../map/position";
import {
  getGridSegmentFromWorldRect,
  getVisibleWorldRect,
} from "../map/visible-cells";
import { ICellEntity } from "./cell-entity";
import { Entities, IEntity, entityHooks, onRender } from "./entities";

export interface IRenderCell {
  (input: {
    canvasCtx: CanvasRenderingContext2D;
    worldPos: WorldPos;
    screenPos: IVec2;
    cellInfos: IRuntimeCellInfos | undefined; // Here for optimization
    camera: ICamera;
  }): void;
}

export class GameMap implements IEntity {
  private _grid: Grid<IRuntimeCellInfos>;
  private _camera: Ref<ICamera>;
  private _cellSize: Ref<number>;
  private _mouseScreenPos: Ref<Vec2 | undefined>;
  private _bgColor: Ref<string>;
  private _renderCell: IRenderCell;
  private _cellEntities: Entities<ICellEntity>;

  constructor(input: {
    grid: Grid<IRuntimeCellInfos>;
    camera: Ref<ICamera>;
    cellSize: Ref<number>;
    mouseScreenPos: Ref<Vec2 | undefined>;
    bgColor: Ref<string>;
    renderCell: IRenderCell;
    cellEntities: Entities<ICellEntity>;
  }) {
    this._camera = input.camera;
    this._cellSize = input.cellSize;
    this._mouseScreenPos = input.mouseScreenPos;
    this._grid = input.grid;
    this._bgColor = input.bgColor;
    this._renderCell = input.renderCell;
    this._cellEntities = input.cellEntities;
  }

  setup(): void {
    this._cellEntities.list.forEach((entity) => entity.setup());

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

          this._renderCell({
            canvasCtx: input.canvasCtx,
            worldPos: worldPos,
            screenPos: screenPos,
            cellInfos: cellInfos,
            camera: this._camera.value,
          });

          for (const entity of cellInfos?.entities ?? []) {
            entityHooks.get(entity)?.onCellRender?.forEach((listener) => {
              listener({
                canvasCtx: input.canvasCtx,
                worldPos: worldPos,
                screenPos: screenPos,
                cellInfos: cellInfos,
                camera: this._camera.value,
                halfCellSize: this._cellSize.value / 2,
              });
            });
          }
        }
      }

      // Draw the hovered cell

      if (this._mouseScreenPos.value !== undefined) {
        let mouseWorldPos = screenToWorld({
          camera: this._camera.value,
          cellSize: this._cellSize.value,
          screenSize: screenSize,
          screenPos: this._mouseScreenPos.value,
        });

        mouseWorldPos = new Vec3(
          Math.round(mouseWorldPos.x),
          Math.round(mouseWorldPos.y),
          Math.round(mouseWorldPos.z)
        );

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
