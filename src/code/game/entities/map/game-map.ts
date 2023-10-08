import { IVec2, Vec2 } from 'src/code/misc/vec2';
import { IVec3, Vec3 } from 'src/code/misc/vec3';
import { Ref } from 'vue';

import { ICamera, screenToWorld, worldToScreen } from '../../camera';
import { IRuntimeCellInfos } from '../../map/cells';
import { Grid } from '../../map/grid';
import { IGridSegment } from '../../map/grid-segment';
import {
  getGridSegmentFromWorldRect,
  getVisibleWorldRect,
} from '../../map/visible-cells';
import {
  Entities,
  entityHooks,
  IEntity,
  onDestroy,
  onInput,
  onRender,
} from '../entities';
import { ICellEntity } from './cell-entity';

export interface IRenderCell {
  (input: {
    canvasCtx: CanvasRenderingContext2D;
    worldPos: IVec3;
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
  private _renderGround: IRenderCell;
  private _renderNonGround: IRenderCell;
  public readonly cellEntities: Entities<ICellEntity>;

  constructor(input: {
    grid: Grid<IRuntimeCellInfos>;
    camera: Ref<ICamera>;
    cellSize: Ref<number>;
    mouseScreenPos: Ref<Vec2 | undefined>;
    bgColor: Ref<string>;
    renderGround: IRenderCell;
    renderNonGround: IRenderCell;
  }) {
    this._camera = input.camera;
    this._cellSize = input.cellSize;
    this._mouseScreenPos = input.mouseScreenPos;
    this._grid = input.grid;
    this._bgColor = input.bgColor;
    this._renderGround = input.renderGround;
    this._renderNonGround = input.renderNonGround;
    this.cellEntities = new Entities();
  }

  private _drawLayer(input: {
    gridSegment: IGridSegment<IRuntimeCellInfos | undefined>;
    screenSize: IVec2;
    canvasCtx: CanvasRenderingContext2D;
    drawCell: (input: {
      worldPos: IVec3;
      screenPos: IVec2;
      cellInfos: IRuntimeCellInfos | undefined;
    }) => void;
  }) {
    for (let y = 0; y < input.gridSegment.cells[0].length; y++) {
      const row = input.gridSegment.cells[0][y];

      for (let x = 0; x < row.length; x++) {
        const cellInfos = row[x];

        const worldPos = new Vec3(
          input.gridSegment.from.x + x,
          input.gridSegment.from.y + y,
          input.gridSegment.from.z
        );

        const screenPos = worldToScreen({
          screenSize: input.screenSize,
          camera: this._camera.value,
          worldPos: worldPos,
          cellSize: this._cellSize.value,
        });

        input.drawCell({
          worldPos: worldPos,
          screenPos: screenPos,
          cellInfos: cellInfos,
        });
      }
    }
  }

  setup(): void {
    this.cellEntities.list.forEach((entity) => entity.setup());

    onInput((input) => {
      for (const entity of this.cellEntities.list) {
        for (const listener of entityHooks.get(entity)?.onInput ?? []) {
          listener(input);
        }
      }
    });

    onRender((input) => {
      const screenSize = new Vec2(
        input.canvasCtx.canvas.width,
        input.canvasCtx.canvas.height
      );

      const visibleWorldRect = getVisibleWorldRect({
        screenSize: screenSize,
        camera: this._camera.value,
        cellSize: this._cellSize.value,
      });

      const gridSegment = getGridSegmentFromWorldRect({
        grid: this._grid,
        worldRect: visibleWorldRect,
      });

      // Clear the canvas

      input.canvasCtx.save();
      input.canvasCtx.fillStyle = this._bgColor.value;
      input.canvasCtx.fillRect(0, 0, screenSize.x, screenSize.y);
      input.canvasCtx.restore();

      // Draw the map

      this._drawLayer({
        canvasCtx: input.canvasCtx,
        gridSegment: gridSegment,
        screenSize: screenSize,
        drawCell: (input_) => {
          this._renderGround({
            canvasCtx: input.canvasCtx,
            worldPos: input_.worldPos,
            screenPos: input_.screenPos,
            cellInfos: input_.cellInfos,
            camera: this._camera.value,
          });
        },
      });

      this._drawLayer({
        canvasCtx: input.canvasCtx,
        gridSegment: gridSegment,
        screenSize: screenSize,
        drawCell: (input_) => {
          this._renderNonGround({
            canvasCtx: input.canvasCtx,
            worldPos: input_.worldPos,
            screenPos: input_.screenPos,
            cellInfos: input_.cellInfos,
            camera: this._camera.value,
          });

          for (const entity of input_.cellInfos?.entities ?? []) {
            entityHooks.get(entity)?.onCellRender?.forEach((listener) => {
              listener({
                canvasCtx: input.canvasCtx,
                worldPos: input_.worldPos,
                screenPos: input_.screenPos,
                screenSize: screenSize,
                cellInfos: input_.cellInfos,
                camera: this._camera.value,
                cellSize: this._cellSize.value,
                halfCellSize: this._cellSize.value / 2,
              });
            });
          }
        },
      });

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
        input.canvasCtx.strokeStyle = mouseCell?.revealed
          ? '#f0f0f0'
          : '#00d000';
        input.canvasCtx.lineWidth = 2;
        input.canvasCtx.strokeRect(
          mouseScreenPos.x -
            (this._cellSize.value / 2) * this._camera.value.zoom,
          mouseScreenPos.y -
            (this._cellSize.value / 2) * this._camera.value.zoom,
          this._cellSize.value * this._camera.value.zoom,
          this._cellSize.value * this._camera.value.zoom
        );
        input.canvasCtx.restore();
      }
    });

    onDestroy(() => {
      this.cellEntities.clear();
    });
  }
}
